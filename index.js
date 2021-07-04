import { Stitcher } from './stitcher.js'

var imageSelect = document.getElementById("imageSelect")
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var stitch = document.getElementById('stitch')

var s_p = document.getElementById('slider_p')
var s_s = document.getElementById('slider_s')

var s_p_text = document.getElementById('s_p_text');
var s_s_text = document.getElementById('s_s_text');

var d_b = document.getElementById('download')

var drag = document.getElementById('drag')

var drag_c = drag.getContext('2d')

var css = document.querySelector(':root')

let currentStitcher;

let previewEnabled = true;

const preview = () => {
    currentStitcher.preview(drag, drag_c);
}

imageSelect.addEventListener('change', async function(event) {
    const files = event.target.files;
    
    if(files.length <= 0) return;

    let stitcher = new Stitcher(files, canvas, context);

    currentStitcher = stitcher;

    await stitcher.init();

    if(previewEnabled)
        preview()
})

s_p.oninput = () => {
    s_p_text.innerHTML = "Preview scale: " + s_p.value + "%";
    css.style.setProperty('--scale_p', s_p.value + "%")
    currentStitcher.updatePreviewDrag(drag, drag_c)
}

s_s.oninput = () => {
    s_s_text.innerHTML = "Stitched preview scale: " + s_s.value + "%";
    css.style.setProperty('--scale_s', s_s.value + "%")
}

export function resetScale() {
    s_p_text.innerHTML = "Preview scale: " + "100%";
    css.style.setProperty('--scale_p', "100%")
}

const clear = () => {
    document.getElementById('stitched').innerHTML = ''
    currentStitcher = undefined
}

stitch.onclick = () => {
    if(!currentStitcher) return

    currentStitcher.stitch()

    // if(previewEnabled)
    //     preview()
}

d_b.onclick = () => {
    currentStitcher.save();

    clear()
}