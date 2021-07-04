import {resetScale} from './index.js'

export class Stitcher {
    canvas
    context
    files
    images = []

    width
    height
    trueHeight = 0

    drag
    
    static current
    
    /**
     * Files to input
     * @param {Array} array 
     */
    constructor(array, canvas, context) {
        this.files = array
        this.canvas = canvas
        this.context = context

        Stitcher.current = this

        let previewElement = document.getElementById("preview")
        previewElement.innerHTML = ''
    }

    async init() {
        return new Promise(async (res, rej) => {
            let width = await this.getWidth(this.files[0])
            
            let imageLoads = []

            for(let file of this.files) {
                imageLoads.push(this.load(file))
            }

            this.width = width;
            this.images = []
            this.trueHeight = 0
            
            Promise.all(imageLoads).then((images) => {
                for(let i = 0; i < images.length; ++i) {
                    this.images.push(new S_Image(images[i], this.files[i].name))
                    this.trueHeight += images[i].height
                }
                res();
            })
        })
    }

    static col1 = '#7e919e'
    static col2 = '#49545c'

    drag
    drag_c
    preview(cvs = null, ctx= null) {

        let canvas = cvs
        let context = ctx
        if(!cvs) {
            canvas = this.drag
            context = this.drag_c
        } else {
            this.drag = cvs
            this.drag_c = ctx
        }

        let height = 0;

        let previewElement = document.getElementById("preview")
        previewElement.innerHTML = ''

        for(let s_image of this.images) {
            let image = s_image.image;
            height += image.height;
            previewElement.appendChild(image)
            //previewElement.innerHTML += '<br>'
        }

        this.height = height;

        this.updatePreviewDrag(canvas, context)
    }

    updatePreviewDrag(canvas, context) {

        let previewElement = document.getElementById("preview")

        let height = 0;

        for(let s_image of this.images) {
            let image = s_image.image;
            height += image.height;
        }

        this.height = height;

        let widthSample = document.createElement('div');

        previewElement.appendChild(widthSample);

        let scale = widthSample.getBoundingClientRect().width / this.images[0].image.width;
        
        canvas.height = this.height;

        context.fillStyle = Stitcher.col1

        context.fillRect(0, 0, canvas.width, this.height * scale)

        let offset = 0;
        context.fillStyle = Stitcher.col2

        for(let i = 0; i < this.images.length; ++i) {
            let image = this.images[i].image;

            if(i % 2 == 0)
                context.fillRect(0, offset, canvas.width, image.height * scale)

            offset += image.height * scale
        }

        this.drag = canvas;
    }

    async stitch() {
        let previewElement = document.getElementById("preview")
        previewElement.innerHTML = ''

        await this.init()


        let height = 0
 
        for(let i = 0; i < this.images.length; ++i) {

            height += this.images[i].image.height
        }

        this.canvas.width = this.width;
        this.canvas.height = this.trueHeight;

        this.height = height;

        let offset = 0;
        for(let toDraw of this.images) {
            this.drawImage(toDraw.image, offset);
            offset += toDraw.image.height;
        }

        
        this.export()
        
    }

    export() {
        let img = this.canvas.toDataURL('image/png')
        document.getElementById('stitched').innerHTML = ('<img src="' + img + '"/>')
    }

    save() {
        let l = document.createElement('a')
        l.download = 'stitched.png'
        l.href = this.canvas.toDataURL()
        l.click()
        l.delete;
    }

    drawImage(image, offset) {
        this.context.drawImage(image, 0, offset, this.width, image.height)

    }

    async load(image) {
        return new Promise((res, rej) => {
            let file = new Image()

            file.onload = () => {
                res(file)
            }

            file.src = URL.createObjectURL(image);
        })
    }

    async getWidth(sample) {
        return new Promise((res, rej) => {
            let img = new Image()

            img.onload = () => {
                res(img.width);
            }

            img.src = URL.createObjectURL(sample);
        })
    }

    static down = false;

    static m_down(e) {
        if(!Stitcher.current) return

        let c = Stitcher.current.drag.getBoundingClientRect()

        console.log(e.clientY)
        if(e.pageX > c.left && e.pageX < c.right && e.clientY < c.bottom  && e.clientY  > c.top ) {

            Stitcher.down = true;
        }

    }

    static lastY

    static grace = 0;

    static m_move(e) {
        if(!Stitcher.current) return;

        if(!Stitcher.current.images) return

        if(!Stitcher.lastY) {
            Stitcher.lastY = e.pageY
        }

        if(Stitcher.down) {
            let i1 = Stitcher.getIndex(Stitcher.lastY)
            let i2 = Stitcher.getIndex(e.pageY)

            if(i1 != i2 && Stitcher.grace < 0) {
                if(! (Math.abs(i1 - i2) > 2)) {

                    let stitcher = Stitcher.current;

                    Stitcher.switch(stitcher.images, i1, i2)

                    stitcher.preview();
                }
                Stitcher.grace = 20
            }
            
            Stitcher.grace--
        }

        Stitcher.lastY = e.pageY

    }

    static switch(array, i1, i2) {
        let temp = array[i1]

        array[i1] = array[i2]
        array[i2] = temp
    }

    static getIndex(y) {
        let dist = y;

        for(let i = 0; i < Stitcher.current.images.length; ++i) {
            let image = Stitcher.current.images[i].image;
            dist -= image.height;
            if(dist <= 0) {
                return i;
            }
        }

        return Stitcher.image.length - 1
    }

    static m_up(e) {
        Stitcher.down = false;
    }
}

class S_Image {
    image
    name

    constructor(image, name) {
        this.image = image;
        this.name = name;
    }
}

document.onmousedown = Stitcher.m_down

document.onmouseup = Stitcher.m_up

document.onmousemove = Stitcher.m_move

document.onmouse