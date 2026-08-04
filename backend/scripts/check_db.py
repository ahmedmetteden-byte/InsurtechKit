from sqlalchemy import create_engine, text

e = create_engine(
    "postgresql+psycopg://insurtech:insurtech@127.0.0.1:5432/insurtech",
    connect_args={"connect_timeout": 8},
)
with e.connect() as c:
    n = c.execute(text("select count(*) from information_schema.tables where table_schema='public'")).scalar()
    print("tables", n)
    try:
        v = c.execute(text("select version_num from alembic_version")).scalar()
        print("alembic", v)
    except Exception as err:
        print("alembic_version missing", type(err).__name__)
    try:
        p = c.execute(text("select count(*) from products")).scalar()
        print("products", p)
    except Exception as err:
        print("products missing", type(err).__name__)
