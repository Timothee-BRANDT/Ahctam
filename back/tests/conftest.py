import pytest
from app import create_app
from pytest_mock import MockerFixture


@pytest.fixture(scope='session')
def app():
    """
    Crée une instance de l'application Flask pour les tests avec une configuration spécifique.
    """
    app = create_app()
    app.config.update({
        'TESTING': True,
        'WTF_CSRF_ENABLED': False,
        'DATABASE_URI': 'sqlite:///:memory:'
    })
    return app


@pytest.fixture
def client(app):
    """
    Fournit un client de test qui peut être utilisé pour faire des requêtes à l'application.
    """
    return app.test_client()


@pytest.fixture
def runner(app):
    """
    Fournit un runner de commandes CLI qui peut être utilisé pour appeler les commandes Flask CLI enregistrées.
    """
    return app.test_cli_runner()


@pytest.fixture(autouse=True)
def mock_db_connection(mocker: MockerFixture):
    # Créer un objet mock pour la connexion
    mock_conn = mocker.MagicMock()
    # S'assurer que toutes les fonctions nécessaires sont mockées
    mock_cursor = mock_conn.cursor.return_value
    mock_cursor.fetchone.return_value = None
    mock_cursor.fetchall.return_value = []
    mock_cursor.execute.return_value = None
    mock_cursor.commit.return_value = None
    # Appliquer le patch
    patch = mocker.patch('app.database.get_db_connection',
                         return_value=mock_conn)
    yield mock_conn
    patch.stop()


@pytest.fixture
def db_transaction(db_connection):
    # Démarrer une transaction
    db_connection.begin()
    yield db_connection
    # Annuler la transaction après le test
    db_connection.rollback()
