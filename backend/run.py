import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    is_local = "PORT" not in os.environ
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=is_local)
