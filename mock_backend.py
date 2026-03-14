"""
数据市场 Mock Backend - 用于前端调试

启动方式：
    python mock_backend.py

功能：
    ✅ 用户登录/注册（假认证）
    ✅ 文件列表（返回假数据）
    ✅ 文件下载（返回假文件）
"""

from fastapi import FastAPI, Body, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import secrets
import os
from pathlib import Path

app = FastAPI(title="数据市场 Mock Backend")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock 用户数据库（使用 username 作为键）
MOCK_USERS = {
    "test": {
        "id": 1,
        "username": "test",
        "email": "test@example.com",
        "password": "123456",  # 明文存储（仅 Mock 用）
        "name": "测试用户",
        "token": "mock_token_12345"
    },
    "admin": {
        "id": 2,
        "username": "admin",
        "email": "admin@example.com",
        "password": "admin123",
        "name": "管理员",
        "token": "mock_token_admin"
    }
}

# Mock 数据集
MOCK_DATASETS = [
    {
        "id": 1,
        "name": "销售数据分析.csv",
        "domain": "商业分析",
        "dataType": "CSV",
        "description": "2024年Q1-Q3销售数据，包含产品、地区、销售额等字段",
        "downloads": 156,
        "isListed": True,
        "ownerId": 1,
        "createdAt": "2024-01-15",
        "fileUrl": "/mock-files/sales_data.csv",
        "size": 245678
    },
    {
        "id": 2,
        "name": "用户行为数据.xlsx",
        "domain": "用户分析",
        "dataType": "Excel",
        "description": "电商平台用户行为数据，包含浏览、点击、购买等行为记录",
        "downloads": 89,
        "isListed": True,
        "ownerId": 1,
        "createdAt": "2024-02-20",
        "fileUrl": "/mock-files/user_behavior.xlsx",
        "size": 512000
    },
    {
        "id": 3,
        "name": "股票市场数据.json",
        "domain": "金融分析",
        "dataType": "JSON",
        "description": "沪深300成分股近5年的日K线数据",
        "downloads": 234,
        "isListed": True,
        "ownerId": 1,
        "createdAt": "2024-03-10",
        "fileUrl": "/mock-files/stock_data.json",
        "size": 1024000
    },
    {
        "id": 4,
        "name": "气象数据集.csv",
        "domain": "气象分析",
        "dataType": "CSV",
        "description": "全国主要城市2023年气象数据（温度、湿度、降水等）",
        "downloads": 67,
        "isListed": False,
        "ownerId": 1,
        "createdAt": "2024-04-05",
        "fileUrl": "/mock-files/weather_data.csv",
        "size": 890000
    },
    {
        "id": 5,
        "name": "房价数据.xlsx",
        "domain": "房地产分析",
        "dataType": "Excel",
        "description": "一二线城市房价走势数据（2020-2024）",
        "downloads": 178,
        "isListed": True,
        "ownerId": 1,
        "createdAt": "2024-05-12",
        "fileUrl": "/mock-files/housing_price.xlsx",
        "size": 678000
    }
]

# ============ 认证相关接口 ============

@app.post("/api/auth/login")
async def login(credentials: dict = Body(...)):
    """用户登录"""
    username = credentials.get("username")
    password = credentials.get("password")
    
    # 检查用户是否存在
    user = MOCK_USERS.get(username)
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    
    # 检查密码
    if user["password"] != password:
        raise HTTPException(status_code=401, detail="密码错误")
    
    return JSONResponse({
        "success": True,
        "message": "登录成功",
        "token": user["token"],
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "name": user["name"]
        }
    })

@app.post("/api/auth/register")
async def register(user_info: dict = Body(...)):
    """用户注册（Mock - 总是成功）"""
    username = user_info.get("username", f"user_{secrets.token_hex(4)}")
    
    # 检查用户名是否已存在
    if username in MOCK_USERS:
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 生成新用户
    new_token = f"mock_token_{secrets.token_hex(8)}"
    new_user = {
        "id": len(MOCK_USERS) + 1,
        "username": username,
        "email": user_info.get("email", f"{username}@example.com"),
        "password": user_info.get("password", "123456"),
        "name": user_info.get("name", username),
        "token": new_token
    }
    
    MOCK_USERS[username] = new_user
    
    return JSONResponse({
        "success": True,
        "message": "注册成功",
        "token": new_token,
        "user": {
            "id": new_user["id"],
            "username": new_user["username"],
            "email": new_user["email"],
            "name": new_user["name"]
        }
    })

# ============ 数据集相关接口 ============

@app.get("/api/datasets/mine")
async def get_my_datasets():
    """获取当前用户的数据集（不检查认证，直接返回）"""
    # 在真实环境中，这里应该从 Authorization header 获取 token 并验证
    # Mock 模式下直接返回用户 1 的数据
    
    owned = [ds for ds in MOCK_DATASETS if ds["ownerId"] == 1]
    
    return JSONResponse({
        "success": True,
        "owned": owned,
        "downloaded": []  # 简化起见，暂时返回空数组
    })

@app.get("/api/datasets")
async def get_all_datasets():
    """获取所有已上架的数据集"""
    listed = [ds for ds in MOCK_DATASETS if ds["isListed"]]
    
    return JSONResponse({
        "success": True,
        "datasets": listed,
        "total": len(listed)
    })

@app.get("/api/datasets/{dataset_id}")
async def get_dataset_detail(dataset_id: int):
    """获取数据集详情"""
    dataset = next((ds for ds in MOCK_DATASETS if ds["id"] == dataset_id), None)
    
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    
    return JSONResponse({
        "success": True,
        "dataset": dataset
    })

@app.get("/api/datasets/{dataset_id}/download")
async def download_dataset(dataset_id: int):
    """下载数据集（返回 Mock 文件）"""
    dataset = next((ds for ds in MOCK_DATASETS if ds["id"] == dataset_id), None)
    
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    
    # 生成一个临时的 Mock CSV 文件
    mock_data_dir = Path("mock_data_files")
    mock_data_dir.mkdir(exist_ok=True)
    
    file_path = mock_data_dir / dataset["name"]
    
    # 如果文件不存在，创建一个假的 CSV 文件
    if not file_path.exists():
        with open(file_path, "w", encoding="utf-8") as f:
            if dataset["dataType"] == "CSV":
                f.write("ID,产品名称,销售额,日期,地区\n")
                f.write("1,产品A,15000,2024-01-15,北京\n")
                f.write("2,产品B,23000,2024-01-16,上海\n")
                f.write("3,产品C,18500,2024-01-17,广州\n")
            elif dataset["dataType"] == "JSON":
                f.write('{"data": [{"id": 1, "value": 100}, {"id": 2, "value": 200}]}')
            else:
                f.write("Mock 数据文件内容\n这是一个用于测试的假数据文件")
    
    return FileResponse(
        path=file_path,
        filename=dataset["name"],
        media_type="application/octet-stream"
    )

@app.patch("/api/datasets/{dataset_id}/listing")
async def update_listing_status(dataset_id: int, status_update: dict = Body(...)):
    """更新数据集上架状态"""
    dataset = next((ds for ds in MOCK_DATASETS if ds["id"] == dataset_id), None)
    
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    
    is_listed = status_update.get("isListed", dataset["isListed"])
    dataset["isListed"] = is_listed
    
    return JSONResponse({
        "success": True,
        "message": "更新成功",
        "dataset": dataset
    })

@app.post("/api/datasets")
async def create_dataset(dataset_info: dict = Body(...)):
    """创建新数据集（Mock）"""
    new_dataset = {
        "id": len(MOCK_DATASETS) + 1,
        "name": dataset_info.get("name", "新数据集.csv"),
        "domain": dataset_info.get("domain", "其他"),
        "dataType": dataset_info.get("dataType", "CSV"),
        "description": dataset_info.get("description", ""),
        "downloads": 0,
        "isListed": False,
        "ownerId": 1,
        "createdAt": "2024-06-01",
        "fileUrl": f"/mock-files/file_{len(MOCK_DATASETS) + 1}.csv",
        "size": 100000
    }
    
    MOCK_DATASETS.append(new_dataset)
    
    return JSONResponse({
        "success": True,
        "message": "数据集创建成功",
        "dataset": new_dataset
    })

# ============ 健康检查 ============

@app.get("/")
async def root():
    return {
        "service": "数据市场 Mock Backend",
        "status": "running",
        "message": "这是一个用于前端调试的 Mock 服务"
    }

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "mode": "mock",
        "datasets_count": len(MOCK_DATASETS),
        "users_count": len(MOCK_USERS)
    }

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("🏪 数据市场 Mock Backend 启动中...")
    print("=" * 60)
    print(f"🌐 API 地址: http://localhost:3001")
    print(f"📋 API 文档: http://localhost:3001/docs")
    print("=" * 60)
    print("✅ 已启用功能:")
    print("   - 用户登录/注册 (/api/auth/login, /api/auth/register)")
    print("   - 数据集列表 (/api/datasets, /api/datasets/mine)")
    print("   - 数据集下载 (/api/datasets/{id}/download)")
    print("   - 数据集管理 (/api/datasets/{id})")
    print("=" * 60)
    print("🔑 测试账号:")
    print("   用户名: test")
    print("   密码: 123456")
    print("   ---")
    print("   用户名: admin")
    print("   密码: admin123")
    print("=" * 60)
    print("⚠️  注意: 所有数据都是 Mock 数据，用于前端调试")
    print("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=3001)
