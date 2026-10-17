"""Package the independent banking demo as one HTML file and a source ZIP."""

from base64 import b64encode
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

source = Path(__file__).resolve().parent
output = source.parents[1] / "outputs"
output.mkdir(parents=True, exist_ok=True)

html = (source / "index.html").read_text(encoding="utf-8")
css = (source / "styles.css").read_text(encoding="utf-8")
refined_css = (source / "refined.css").read_text(encoding="utf-8")
polish_css = (source / "polish.css").read_text(encoding="utf-8")
logos = {
    path.stem: "data:image/svg+xml;base64," + b64encode(path.read_bytes()).decode("ascii")
    for path in sorted((source / "assets" / "logos").glob("*.svg"))
}
asset_script = "window.REVOLUT_DEMO_ASSETS = " + json.dumps(logos, separators=(",", ":")) + ";"
(source / "assets.js").write_text(asset_script, encoding="utf-8")
font = b64encode((source / "assets" / "Inter-variable.woff2").read_bytes()).decode("ascii")
refined_css = refined_css.replace(
    'url("assets/Inter-variable.woff2")', f'url("data:font/woff2;base64,{font}")'
)
script = (source / "app.js").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="styles.css">', f"<style>\n{css}\n{refined_css}\n</style>")
html = html.replace('<link rel="stylesheet" href="refined.css">', "")
html = html.replace('<link rel="stylesheet" href="polish.css">', f"<style>\n{polish_css}\n</style>")
icon = "data:image/svg+xml;base64," + b64encode((source / "assets" / "app-icon.svg").read_bytes()).decode("ascii")
html = html.replace('<link rel="icon" href="assets/app-icon.svg" type="image/svg+xml">', f'<link rel="icon" href="{icon}" type="image/svg+xml">')
html = html.replace('<script src="assets.js"></script>', f"<script>\n{asset_script}\n</script>")
html = html.replace('<script src="app.js"></script>', f"<script>\n{script}\n</script>")

standalone = output / "revolut-demo-v20.html"
standalone.write_text(html, encoding="utf-8")

(source / "preview.html").write_text(html, encoding="utf-8")

archive_path = output / "revolut-demo-v20-source.zip"
with ZipFile(archive_path, "w", ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(source.rglob("*")):
        if path.is_file() and "__pycache__" not in path.parts:
            archive.write(path, arcname="revolut-demo/" + path.relative_to(source).as_posix())

print(standalone)
print(archive_path)
