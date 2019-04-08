from flask_restplus import Namespace

from ..minespace.resources.minespace_user import MinespaceUserResource
from ..minespace.resources.minespace_user_mine import MinespaceUserMineResource

from ..core.resources.core_user import CoreUserListResource, CoreUserResource

api = Namespace('users', description='User related operations')

api.add_resource(MinespaceUserResource, '/minespace', '/minespace/<user_id>')
api.add_resource(MinespaceUserMineResource, '/minespace', '/minespace/<user_id>/mines',
                 '/minespace/<user_id>/mines/<string:mine_guid>')

api.add_resource(CoreUserListResource, '/core')
api.add_resource(CoreUserResource, '/core/<core_user_guid>')