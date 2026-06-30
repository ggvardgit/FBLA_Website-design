"""Smoke test: Flask app imports (CI)."""


def test_app_imports():
    import app as app_module

    assert app_module.app is not None
