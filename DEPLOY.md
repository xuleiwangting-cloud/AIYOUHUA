# 部署指南

本项目分为两部分：
- 前端（`frontend/`）：Vue + Vite，部署到 GitHub Pages（已配置好 Actions）。
- 后端（`backend/`）：Express + Supabase，部署到 Render（GitHub Pages 无法运行后端）。

下面是完整的上线流程。

## 一、后端部署到 Render（免费）

### 1. 注册并连接 GitHub
1. 打开 https://render.com ，用 GitHub 账号登录。
2. 首次使用会要求授权 Render 访问你的 GitHub 仓库，选择授权 `AIYOUHUA` 仓库。

### 2. 用 Blueprint 一键创建服务
本仓库根目录已经有 `render.yaml`，Render 会自动识别。
1. 在 Render 控制台点击 `New +` → `Blueprint`。
2. 选择 `xuleiwangting-cloud/AIYOUHUA` 仓库，点击 `Connect`。
3. Render 读取 `render.yaml`，会显示一个名为 `aiyouhua-backend` 的 Web 服务。
4. 此时它会让你填写标记为 `sync: false` 的环境变量（见下一步）。

### 3. 填写环境变量
在创建页面（或服务的 `Environment` 标签页）填写：

| Key | Value |
| --- | --- |
| `SUPABASE_URL` | 你的 Supabase 项目地址，例如 `https://wqifvfijzgsijbsjukri.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase 的 service/secret key（在 Supabase 后台 Settings → API 里获取） |
| `CORS_ORIGIN` | `https://xuleiwangting-cloud.github.io` |

说明：
- `JWT_SECRET` 已设置为自动生成，无需填写。
- `JWT_EXPIRES_IN` 已默认 `7d`。
- `PORT` 不用填，Render 会自动注入。

### 4. 部署
点击 `Apply` / `Create`，Render 会执行 `npm ci` 并 `npm start`。
- 部署成功后会得到一个后端地址，形如 `https://aiyouhua-backend.onrender.com`。
- 打开 `https://aiyouhua-backend.onrender.com/api/health`，看到 `{"status":"ok"}` 即代表后端正常。

> 免费套餐的服务在闲置约 15 分钟后会休眠，下次访问需要等待几十秒冷启动，属正常现象。

## 二、前端连接后端（GitHub Pages）

### 1. 配置前端的后端地址
1. 打开 GitHub 仓库 `Settings → Secrets and variables → Actions`。
2. 在 `Secrets` 里点击 `New repository secret`，新增：
   - Name：`VITE_API_BASE_URL`
   - Value：`https://aiyouhua-backend.onrender.com/api`（注意结尾要带 `/api`，换成你实际的 Render 地址）

### 2. 开启 GitHub Pages
1. 打开 `Settings → Pages`。
2. `Source` 选择 `GitHub Actions`。

### 3. 触发部署
- 任意一次推送到 `main` 分支都会触发 `.github/workflows/deploy-frontend.yml` 自动构建并发布。
- 也可以在 `Actions` 标签页手动运行该 workflow（`Run workflow`）。
- 部署完成后前端地址为：`https://xuleiwangting-cloud.github.io/AIYOUHUA/`

## 三、验证上线
1. 打开 `https://xuleiwangting-cloud.github.io/AIYOUHUA/`。
2. 点击「立即注册」创建账号 → 登录。
3. 若登录失败，按下面排查。

## 四、常见问题排查
- 登录转圈或报「请检查网络或后端服务」：多半是 Render 服务在冷启动，等 30~60 秒重试。
- 浏览器控制台报 CORS 错误：检查 Render 上的 `CORS_ORIGIN` 是否为 `https://xuleiwangting-cloud.github.io`（不带路径、不带末尾斜杠）。
- 请求 404 或地址不对：检查 GitHub secret `VITE_API_BASE_URL` 是否以 `/api` 结尾，改完要重新触发一次前端部署。
- 改了环境变量不生效：Render 改完环境变量需要 `Manual Deploy → Deploy latest commit`；前端改完 secret 需要重新跑一次 Actions。

## 五、本地开发
后端：
```bash
cd backend
npm install
npm run dev        # http://localhost:3001
```
前端：
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```
本地 `frontend` 已配置代理，会把 `/api` 转发到 `http://localhost:3001`，无需额外配置。

## 安全提醒
- `backend/.env` 含真实密钥，已被 `.gitignore` 忽略，不会提交到 GitHub。
- 之前 `backend/.env.example` 里曾包含真实密钥并已被提交到 GitHub，建议到 Supabase 后台轮换（重置）该 service key，并在 Render 上更新为新值。
