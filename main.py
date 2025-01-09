from flask import Flask, send_from_directory, Response
import mimetypes

app = Flask(__name__)

# Add custom MIME type for .peg files
mimetypes.add_type('application/javascript', '.peg')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    # Determine the MIME type based on the file extension
    mimetype = mimetypes.guess_type(path)[0]
    return send_from_directory('.', path, mimetype=mimetype)

if __name__ == '__main__':
    app.run(debug=True)