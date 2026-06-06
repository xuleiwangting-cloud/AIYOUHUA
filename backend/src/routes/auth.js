import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabase.js';
import { config } from '../config.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    role: user.role,
  };
}

router.post('/register', async (req, res) => {
  const { username, password, display_name } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  if (String(username).length < 3 || String(username).length > 50) {
    return res.status(400).json({ error: '用户名长度需为 3-50 个字符' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: '密码至少 6 位' });
  }

  try {
    const { data: existing, error: queryErr } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (queryErr) throw queryErr;
    if (existing) {
      return res.status(409).json({ error: '该用户名已被注册' });
    }

    const password_hash = await bcrypt.hash(String(password), 10);
    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash,
        display_name: display_name || username,
      })
      .select('id, username, display_name, role, is_active')
      .single();
    if (error) throw error;

    const token = signToken(data);
    return res.status(201).json({ token, user: publicUser(data) });
  } catch (err) {
    console.error('[register] 失败:', err.message);
    return res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, display_name, role, is_active')
      .eq('username', username)
      .maybeSingle();
    if (error) throw error;
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    if (user.is_active === false) {
      return res.status(403).json({ error: '该账号已被禁用' });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('[login] 失败:', err.message);
    return res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, display_name, role, is_active')
      .eq('id', req.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('[me] 失败:', err.message);
    return res.status(500).json({ error: '获取用户信息失败' });
  }
});

router.post('/change-password', authRequired, async (req, res) => {
  const { old_password, new_password } = req.body || {};
  if (!old_password || !new_password) {
    return res.status(400).json({ error: '请填写原密码和新密码' });
  }
  if (String(new_password).length < 6) {
    return res.status(400).json({ error: '新密码至少 6 位' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('id', req.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const ok = await bcrypt.compare(String(old_password), user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: '原密码错误' });
    }

    const password_hash = await bcrypt.hash(String(new_password), 10);
    const { error: updErr } = await supabase
      .from('users')
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);
    if (updErr) throw updErr;

    return res.json({ ok: true });
  } catch (err) {
    console.error('[change-password] 失败:', err.message);
    return res.status(500).json({ error: '修改密码失败，请稍后重试' });
  }
});

export default router;
