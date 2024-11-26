using IronPdf;
using System.IO;

reader = PdfReader("./Green Watercolour Opening Soon Banner.pdf")

page = reader.pages[0]

for count, image_file_object in enumerate(page.images):
    with open(str(count) + image_file_object.name, "wb") as fp:
        fp.write(image_file_object.data)
