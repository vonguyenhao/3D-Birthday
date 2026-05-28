# Memory Images

Put optional birthday memory images in this folder.

Example paths used by the book:

- `public/images/memories/memory-1.jpg`
- `public/images/memories/memory-2.jpg`

Files in `public` are served directly by the browser and are not secret. Do not place private photos here unless you are comfortable with them being publicly accessible after deployment.

Real image files in this folder are ignored by git by default. Use this folder only for safe public placeholders.

For private images, store them outside the repository in private object storage and expose them only through a future authenticated/signed serverless API.
