$file = "C:\Users\aditi\Desktop\devsync-backend-FastAPI\app\features\requests\router.py"
$content = Get-Content $file -Raw
$newEndpoint = @"

@router.delete("/user/{to_id}")
async def cancel_request(
    to_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Cancel a sent connection request.
    """
    result = await db.execute(
        select(Request).filter(
            Request.from_id == current_user.id,
            Request.to_id == to_id,
            Request.status == "pending"
        )
    )
    req_to_delete = result.scalars().first()

    if not req_to_delete:
        raise HTTPException(status_code=404, detail="Request not found")

    await db.delete(req_to_delete)
    await db.commit()
    return {"message": "Request cancelled successfully"}
"@

$content += $newEndpoint
Set-Content -Path $file -Value $content
