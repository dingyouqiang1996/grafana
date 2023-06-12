"""
This module has functions for Drone services to be used in pipelines.
"""

load(
    "scripts/drone/utils/images.star",
    "images",
)

def integration_test_services_volumes():
    return [
        {"name": "postgres", "temp": {"medium": "memory"}},
        {"name": "mysql", "temp": {"medium": "memory"}},
    ]

def integration_test_services(edition):
    services = [
        {
            "name": "postgres",
            "image": images["postgres_alpine_image"],
            "environment": {
                "POSTGRES_USER": "grafanatest",
                "POSTGRES_PASSWORD": "grafanatest",
                "POSTGRES_DB": "grafanatest",
                "PGDATA": "/var/lib/postgresql/data/pgdata",
            },
            "volumes": [
                {"name": "postgres", "path": "/var/lib/postgresql/data/pgdata"},
            ],
        },
        {
            "name": "mysql",
            "image": images["mysql5_image"],
            "environment": {
                "MYSQL_ROOT_PASSWORD": "rootpass",
                "MYSQL_DATABASE": "grafana_tests",
                "MYSQL_USER": "grafana",
                "MYSQL_PASSWORD": "password",
            },
            "volumes": [{"name": "mysql", "path": "/var/lib/mysql"}],
        },
    ]

    if edition in ("enterprise", "enterprise2"):
        services.extend(
            [
                {
                    "name": "redis",
                    "image": "redis:6.2.1-alpine",
                    "environment": {},
                },
                {
                    "name": "memcached",
                    "image": "memcached:1.6.9-alpine",
                    "environment": {},
                },
            ],
        )

    return services

def ldap_service():
    return {
        "name": "ldap",
        "image": images["openldap_image"],
        "environment": {
            "LDAP_ADMIN_PASSWORD": "grafana",
            "LDAP_DOMAIN": "grafana.org",
            "SLAPD_ADDITIONAL_MODULES": "memberof",
        },
    }
