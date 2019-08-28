import json


class EnvBuilder:
    """A utility to assemble environment config for a pod"""

    env = []

    def __init__(self):
        self.env = []

    def add_value(self, key, value):
        _value = {
            "name": key,
            "value": value
        },

        self.env.append(_value)

    def add_secret(self, key, secret_key, secret_name):

        _value = {
            "name": key,
            "valueFrom": {
                "secretKeyRef": {
                    "key": secret_key,
                    "name": secret_name
                }
            }
        }

        self.env.append(_value)

    def to_json(self):
        print(json.dumps(self.env))

        return json.dumps(self.env)