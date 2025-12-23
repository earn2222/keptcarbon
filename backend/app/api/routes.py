from fastapi import APIRouter
from app.api.endpoints import plots, carbon, users, auth

router = APIRouter()

# Include endpoint routers
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(plots.router, prefix="/plots", tags=["Plots"])
router.include_router(carbon.router, prefix="/carbon", tags=["Carbon Calculation"])
