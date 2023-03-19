let model
let videoWidth, videoHeight
let ctx, canvas
const log = document.querySelector("#array")
const VIDEO_WIDTH = 720
const VIDEO_HEIGHT = 405
//import * as knn from '@tensorflow-models/knn-classifier';
//const numArray = []; 

const k = 3
const KNN = new kNear(k)
let stop_peace=true
let stop_metal=true
let stop_nothing=true


//
// start de applicatie
//
async function main() {
   
        model = await handpose.load()
        const video = await setupCamera()
        video.play()
        console.log(stop)
        startLandmarkDetection(video)   
}

//
// start de webcam
//
async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            "Webcam not available"
        )
    }

    const video = document.getElementById("video")
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: "environment",
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT
        }
    })
    video.srcObject = stream

    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve(video)
        }
    })
}

//
// predict de vinger posities in de video stream
//
async function startLandmarkDetection(video) {

    videoWidth = video.videoWidth
    videoHeight = video.videoHeight

    canvas = document.getElementById("output")

    canvas.width = videoWidth
    canvas.height = videoHeight

    ctx = canvas.getContext("2d")

    video.width = videoWidth
    video.height = videoHeight

    ctx.clearRect(0, 0, videoWidth, videoHeight)
    ctx.strokeStyle = "red"
    ctx.fillStyle = "red"

    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1) // video omdraaien omdat webcam in spiegelbeeld is

//new gestures
$("#peace").click(function(){
    stop_peace=true
    stop_metal=false
    stop_nothing=false
    $("#state").html("Wait 3 seconds")
    setTimeout(function(){
        trainpeace()
        $("#state").html("peace training")
    },3000)
})

$("#metal").click(function(){
    stop_peace=false
    stop_metal=true
    stop_nothing=false
    $("#state").html("Wait 3 seconds")
    setTimeout(function(){
        trainmetal()
        $("#state").html("metal training")
    },3000)
})

$("#nothing").click(function(){
    stop_peace=false
    stop_metal=false
    stop_nothing=true
    $("#state").html("Wait 3 seconds")
    setTimeout(function(){
        trainnothing()
        $("#state").html("nothing training")
    },3000)
})

$("#predict").click(function(){
    stop_peace=true
    stop_metal=true
    stop_nothing=true
    $("#state").html("Prediction")
    predictLandmarks()
})
}

async function trainpeace() {
    console.log("peace training");
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
    const predictions = await model.estimateHands(video);
    const numArray = []; 
    
    if (predictions.length > 0) {
        predictions.forEach((prediction) => {
            prediction.landmarks.forEach((landmark) => {
                KNN.learn([landmark[0], landmark[1], landmark[2]], "peace");
                $("#state").html("PEACE training");
            });
        });
        drawHand(ctx, predictions[0].landmarks, predictions[0].annotations);
    }
    if (!stop_peace==false) {
        requestAnimationFrame(trainpeace);
    }
}

async function trainmetal() {
    console.log("metal training");
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
    const predictions = await model.estimateHands(video);
    const numArray = [];
    if (predictions.length > 0) {
        predictions.forEach((prediction) => {
            prediction.landmarks.forEach((landmark) => {
                KNN.learn([landmark[0], landmark[1], landmark[2]], "metal");
                $("#state").html("METAL training");
            });
        });
        drawHand(ctx, predictions[0].landmarks, predictions[0].annotations);
    }
    if (!stop_metal==false) {
        requestAnimationFrame(trainmetal);
    }
}

async function trainnothing() {
    console.log("nothing training");
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
    const predictions = await model.estimateHands(video);
    const numArray = []; 
    if (predictions.length > 0) {
        predictions.forEach((prediction) => {
            prediction.landmarks.forEach((landmark) => {
                KNN.learn([landmark[0], landmark[1], landmark[2]], "nothing");
                $("#state").html("NOTHING training");
            });
        });
        drawHand(ctx, predictions[0].landmarks, predictions[0].annotations);
    }
    if (!stop_nothing==false) {
        requestAnimationFrame(trainnothing);
    }
}


async function predictLandmarks() {
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height)
    // prediction!
    const predictions = await model.estimateHands(video) // ,true voor flip
    const numArray = []; //new

    if (predictions.length > 0) {
     //new
     predictions.forEach((prediction) => {
        prediction.landmarks.forEach((landmark) => {
        let prediction = KNN.classify([landmark[0], landmark[1], landmark[2]])
        //console.log(`I think this is  ${prediction}`)  
        if (prediction=="peace"){
            $("#result").html(prediction+ "✌") 
        }

        if (prediction=="metal"){
            $("#result").html(prediction+ "🤘") 
        }
        if (prediction=="nothing"){
            $("#result").html(prediction+ "nothing") 
        }
    
        });
      });
      

     //new

        //console.log(predictions)
        drawHand(ctx, predictions[0].landmarks, predictions[0].annotations)
    }

    //console.log(numArray)//new
    // 60 keer per seconde is veel, gebruik setTimeout om minder vaak te predicten
    requestAnimationFrame(predictLandmarks)
    // setTimeout(()=>predictLandmarks(), 1000)
}

//new

//
// teken hand en vingers met de x,y coordinaten. de z waarde tekenen we niet.
//
function drawHand(ctx, keypoints, annotations) {
    // toon alle x,y,z punten van de hele hand in het log venster
    //log.innerText = keypoints.flat()

    // punten op alle kootjes kan je rechtstreeks uit keypoints halen 
    for (let i = 0; i < keypoints.length; i++) {
        const y = keypoints[i][0]
        const x = keypoints[i][1]
        drawPoint(ctx, x - 2, y - 2, 3)
    }

    // palmbase als laatste punt toevoegen aan elke vinger
    let palmBase = annotations.palmBase[0]
    for (let key in annotations) {
        const finger = annotations[key]
        finger.unshift(palmBase)
        drawPath(ctx, finger, false)
    }
}

//
// teken een punt
//
function drawPoint(ctx, y, x, r) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fill()
}
//
// teken een lijn
//
function drawPath(ctx, points, closePath) {
    const region = new Path2D()
    region.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length; i++) {
        const point = points[i]
        region.lineTo(point[0], point[1])
    }

    if (closePath) {
        region.closePath()
    }
    ctx.stroke(region)
}

//
// start
//
main()
