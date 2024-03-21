import cloudinary.uploader
cloudinary.config(
    cloud_name="dhdaoxs0s",
    api_key="236447357633674",
    api_secret="9gNlV0izIcVRGlK4TMQjtPp7ihQ"
)
class CloudinaryManager:
    @classmethod
    def upload_image(cls, file, folder):
        valid_extensions = ["jpg", "jpeg", "png", "webp","JPG", "JPEG", "PNG","WEBP", ]

        if file.name.split(".")[-1] not in valid_extensions:
            return ("Invalid file type")

        upload_image=cloudinary.uploader.upload(file=file, folder=folder, user_filename=True, overwrite=True)
        return upload_image.get('url')
    
    @classmethod
    def delete_image(cls, avatar_url):
        cloudinary.uploader.destroy(avatar_url)
        return "Image deleted successfully"