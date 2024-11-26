const PDFStart = async (nameRoute) => {
    console.log('nameRoute', nameRoute);
    let loadingTask = pdfjsLib.getDocument(nameRoute),
        pdfDoc = null,
        canvas = document.querySelector('#cnv'),
        ctx = canvas.getContext('2d'),
        scale = 0.2,
        numPage = 1;

    const GeneratePDF = async (numPage) => {
        const page = await pdfDoc.getPage(numPage);

        var viewport = page.getViewport({ scale: 1 });

        // canvas.height = viewport.height;
        // canvas.width = viewport.width;

        // var renderContext = {
        //     canvasContext: ctx,
        //     viewport: viewport
        // };

        // await page.render(renderContext).promise;

        // return;
        // get text content
        const { items: textItems, styles } = await page.getTextContent();

        console.log(textItems);

        // get image content
        let imgIndex = 1;
        let operatorList = await page.getOperatorList();
        console.log('operatorList', operatorList);
        // let count = 0;
        // let OPS_IMG = [
        //     pdfjsLib.OPS.paintJpegXObject,
        //     pdfjsLib.OPS.paintImageXObject,
        //     // pdfjsLib.OPS.paintImageMaskXObject,
        //     // pdfjsLib.OPS.paintImageMaskXObjectGroup,
        //     // pdfjsLib.OPS.paintInlineImageXObject,
        //     // pdfjsLib.OPS.paintInlineImageXObjectGroup,
        //     // pdfjsLib.OPS.paintImageXObjectRepeat,
        //     // pdfjsLib.OPS.paintImageMaskXObjectRepeat,
        //     // pdfjsLib.OPS.paintSolidColorImageMask,
        //     // pdfjsLib.OPS.paintXObject,
        //     // pdfjsLib.OPS.eoClip,
        // ];
        // async function bufferToBase64(buffer) {
        //     // use a FileReader to generate a base64 data URI:
        //     const base64url = await new Promise(r => {
        //       const reader = new FileReader()
        //       reader.onload = () => r(reader.result)
        //       reader.readAsDataURL(new Blob([buffer]))
        //     });
        //     // remove the `data:...;base64,` part from the start
        //     return base64url.slice(base64url.indexOf(',') + 1);
        //   }
        // for (let i = 0; i < operatorList.fnArray.length; i++) {
        //     if (OPS_IMG.includes(operatorList.fnArray[i])) {
        //         if (operatorList.argsArray[i]) {
        //             let img = await page.objs.get(operatorList.argsArray[i][0]);
        //             console.log(operatorList.argsArray[i][0]);
        //             console.log(img.data);
        //             let base64 = await bufferToBase64(img.data);
        //             console.log('data:image/jpeg;base64,' + base64);
        //             // console.log('data:image/jpeg;base64,' + btoa(img.data));
                    
        //             // imgTag.src = 'data:image/jpeg;base64,' + btoa(img.data);

        //             // div.appendChild(imgTag);

        //             // document.body.appendChild(div);
        //         }
                
        //     }
        // }

        // console.log('count', count);

        // console.log('page.commonObjs', page.commonObjs);
        // console.log('page.objs', page.objs);
        // return;

        var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
        svgGfx.embedFonts = true;

        let svg = await svgGfx.getSVG(operatorList, page.getViewport({ scale: scale }))

        let svgTag = document.createElement('div');
        svgTag.id = 'svgTag';
        svgTag.innerHTML = svg.outerHTML
            .replaceAll('xmlns:svg', 'xmlns') // strip :svg to allow skipping namespace
            .replaceAll('svg:', '')
            .replaceAll('xlink:href', 'href');
        
        let div = document.createElement('div');

        div.innerHTML = svgTag.outerHTML;
        document.body.appendChild(div);

        let tagg = document.querySelector('#svgTag svg');

        let style = tagg.querySelector('style');
        if (style) {
            document.head.appendChild(style);
        }

        let g = tagg.querySelector('g');
        console.log(tagg);

        let gChild = g.children;
        // for (let i = 0; i < gChild.length; i++) {
        //     let rect = gChild[i].getBoundingClientRect();
        //     let svgRect = tagg.getBoundingClientRect();

        //     rect.x = rect.x - svgRect.x;
        //     rect.y = rect.y - svgRect.y;

        //     if (rect.width == svgRect.width && rect.height == svgRect.height) {
        //         console.log('continue');
        //         continue;
        //     } else {
        //         console.log('rect', rect);
        //         console.log('svgRect', svgRect);
        //     }
        // }
        // console.log('tagg', tagg.getBBox());
        let items = [];
        function blobToBase64(blob) {
            return new Promise((resolve, _) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          }
        for (let i = 0; i < gChild.length; i++) {
            let newSvg = svg.cloneNode(true);
            let rect = gChild[i].getBoundingClientRect();
            let svgRect = tagg.getBoundingClientRect();
            if (rect.width == svgRect.width && rect.height == svgRect.height) {
                continue;
            } else {
                let text = gChild[i].querySelector('text');
                if (false) {
                    continue;
                } else {
                    rect.x = rect.x - svgRect.x;
                    rect.y = rect.y - svgRect.y;
                    let gg = newSvg.querySelector('g');
        
                    gg.innerHTML = gChild[i].outerHTML;
    
                    let image = gg.querySelector('image');
                    if (image) {
                        let href = image.getAttribute('href');
    
                        let newHref = await fetch(href, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'image',
                                'Response-Type': 'blob',
                            }
                        });
                        let blob = await newHref.blob();
    
                        let base64 = await blobToBase64(blob);
    
                        image.setAttribute('href', base64);
                    }
                    newSvg.setAttribute('width', rect.width);
                    newSvg.setAttribute('height', rect.height);
                    newSvg.setAttribute('viewBox', `${rect.x} ${rect.y} ${rect.width} ${rect.height}`);
                    newSvg.setAttribute('viewBoxx', `${rect.x} ${rect.y} ${rect.width} ${rect.height}`);
        
                    document.body.appendChild(newSvg);
        
                    const dataUrl = await domtoimage.toPng(newSvg);
    
                    items.push({
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height,
                        left: rect.left,
                        top: rect.top,
                        rigth: rect.right,
                        bottom: rect.bottom,
                        dataUrl: dataUrl,
                    });
                }
            }
        }

        console.log('items', items);

        let svgRect = tagg.getBoundingClientRect();

        canvas.width = svgRect.width;
        canvas.height = svgRect.height;

        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                let img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
                img.onerror = reject;
            });
        };

        const drawImage = async (src, x, y, width, height) => {
            let img = await loadImage(src);
            ctx.drawImage(img, x, y, width, height);
        };

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            await drawImage(item.dataUrl, item.x, item.y, item.width, item.height);
        }

        // for (text of textItems) {
        //     ctx.font = `${text.height * scale}px ${text.fontName}`;
        //     ctx.fillText(text.str, text.transform[4] * scale, text.transform[5] * scale);
        // }


        // console.log(dataUrl);


        // let dataUrl = await domtoimage.toPng(g);


        // var canvas = new fabric.Canvas("cnv");
        // fabric.loadSVGFromString(svg.outerHTML.replaceAll('xmlns:svg', 'xmlns') // strip :svg to allow skipping namespace
        // .replaceAll('svg:', '').replaceAll('xlink:href', 'href'), function(objects, options) {
        // //     console.log('objects', objects);
        // //     console.log('options', options);
        // //     var obj = fabric.util.groupSVGElements(objects, options);
        // //     canvas.width = 1000;
        // //     canvas.height = 1000 * (options.height / options.width);
        // //     obj.scaleToWidth(1000);
        // //     obj.scaleToHeight(1000 * (options.height / options.width));
        // //     canvas.add(obj).renderAll();

        // //     // console.log('objects', objects);
        // //     // console.log('options', options);
        // //     // canvas.setWidth(1000);
        // //     // canvas.setHeight(1000 * (options.height / options.width));
        // //     // objects.forEach(function(obj) {
        // //     //     obj.scaleToWidth(1000);
        // //     //     obj.scaleToHeight(1000 * (options.height / options.width));
        // //     //     canvas.add(obj).renderAll();
        // //     // });
        // });

    };

    const PrevPage = async () => {
        if (numPage === 1) {
            return;
        }
        numPage--;
        await GeneratePDF(numPage);
    };

    const NextPage = async () => {
        if (numPage >= pdfDoc.numPages) {
            return;
        }
        numPage++;
        await GeneratePDF(numPage);
    };

    pdfDoc = await loadingTask.promise;
    const metadata = await pdfDoc.getMetadata();
    console.log('metadata', metadata);
    await GeneratePDF(numPage);
};

const startPdf = () => {
    PDFStart('./Green Floral Watercolor Welcome Spring Banner.pdf');
};

window.addEventListener('load', startPdf);