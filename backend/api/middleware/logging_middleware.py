# api/middleware/logging_middleware.py

import logging
import time
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api')

class AuditLogMiddleware(MiddlewareMixin):
    def process_request(self, request):
        """
        Sets the start time for the request, used for logging purposes.
        Returns None.
        """
        request.start_time = time.time()
        return None

    def process_response(self, request, response):
        """
        Logs information about the request and response.

        The information logged includes the user ID, method, path, status code,
        duration of the request, user agent, and IP address.

        If the request does not have a 'start_time' attribute, nothing is logged.

        If the request path does not start with '/api/', nothing is logged.

        :param request: The request object
        :param response: The response object
        :return: The response object
        :rtype: HttpResponse
        """
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Log apenas para ações específicas
            if request.path.startswith('/api/'):
                user = getattr(request, 'user', None)
                user_id = user.id if user and user.is_authenticated else 'anonymous'
                
                log_data = {
                    'user_id': user_id,
                    'method': request.method,
                    'path': request.path,
                    'status_code': response.status_code,
                    'duration': f'{duration:.3f}s',
                    'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                    'ip_address': self.get_client_ip(request)
                }
                
                logger.info(f"API Request: {log_data}")
        
        return response
    
    def get_client_ip(self, request):
        """
        Returns the client's IP address from the request.

        If the request contains the 'HTTP_X_FORWARDED_FOR' header, the
        first IP address in the list is used. Otherwise, the 'REMOTE_ADDR'
        header is used.

        :return: The client's IP address
        :rtype: str
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip