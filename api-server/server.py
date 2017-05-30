from BaseHTTPServer import BaseHTTPRequestHandler
import SocketServer
from os import curdir, sep
from urlparse import urlparse, parse_qs
import json
import base64
import urllib2
import re
from util import mimeType

PORT = 8000


def is_index_path(path):
    return path in ["", "/"]


def sdc_api_request(host, path):
    request = urllib2.Request('http://%s:18630/rest/v1%s' % (host, path))
    base64string = base64.encodestring('%s:%s' % ("admin", "admin")).replace('\n', '')
    request.add_header("Authorization", "Basic %s" % base64string)
    request.add_header("Content-type", "application/json")
    request.add_header("X-Requested-By", "sdc")

    try:
        f = urllib2.urlopen(request)
        return f.read()
    except urllib2.URLError as e:
        raise ValueError("SDC Error: %s, %s" % (request.get_full_url(), e))


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        if is_index_path(path):
            path = "index.html"

        if path == "/api":
            self._do_get_api_request(parsed_url.query)
        elif re.search('(\.html|\.css|\.js|\.json|\.png|\.jpg)$',  path):
            self._do_get_static_resource(path)
        else:
            self.send_response(404)
            self.end_headers()

    def _do_get_api_request(self, query):
        query_data = parse_qs(query, 1)

        response_data = ""
        try:
            host = query_data['host'][0]
            path = query_data['path'][0]
        except KeyError as e:
            self.send_response(500)
            response_data = "KeyError: %s" % e.message
        else:
            try:
                response_data = sdc_api_request(host, path)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
            except ValueError as e:
                self.send_response(500)
                response_data = e.message
        finally:
            self.end_headers()
            self.wfile.write(response_data)

    def _do_get_static_resource(self, path):
        try:
            f = open(curdir + 'htdocs' + sep + path)
        except IOError:
            self.send_response(404)
            response_data = "404 Not Found"
        else:
            self.send_response(200)
            response_data = f.read()
        finally:
            self.send_header('Content-Type', mimeType[path.split(".")[-1]])
            self.end_headers()

            self.wfile.write(response_data)

    def do_POST(self):
        length = int(self.headers.getheader('content-length'))
        read_str = self.rfile.read(length);
        # data = cgi.parse_qs(, keep_blank_values=1)
        # data2 = json.loads(self.rfile.read(length))
        data = json.loads(read_str)

        print data
        url = data['url']
        response = urllib2.urlopen(url)
        json_data = json.loads(response.read())
        print json_data
        # print self.request.text
        # print data2

        self.send_response(200)
        self.end_headers()


SocketServer.TCPServer.allow_reuse_address = True
httpd = SocketServer.TCPServer(("", PORT), Handler)

print "start server", PORT
httpd.serve_forever()
