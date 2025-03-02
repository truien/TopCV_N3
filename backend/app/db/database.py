from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  

DATABASE_URL = "mysql+pymysql://root:admin@localhost:3306/topcv_be"


engine = create_engine(DATABASE_URL)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


Base.metadata.create_all(bind=engine)
