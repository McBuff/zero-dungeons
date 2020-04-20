var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

    /******* Add the create scene function ******/
var createScene = function () {
    // Create the scene space
    var scene = new BABYLON.Scene(engine);
    //scene.clearColor= new BABYLON.Color3(.1,.5,.5);

    // Add a camera to the scene and attach it to the canvas
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0,2,5), scene);
    camera.attachControl(canvas, true);

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);

    // Add and manipulate meshes in the scene
    CreateArena();
    //CreateDice();

    return scene;
    };
    /******* End of the create scene function ******/

function CreateArena() {
    /*var tiledPlane = BABYLON.MeshBuilder.CreateTiledPlane("plane", {size: 20});
    tiledPlane.rotation = new BABYLON.Vector3(Math.PI/2,0,0);
    tiledPlane.position = new BABYLON.Vector3(0,-10,0);
    */
   var ground = BABYLON.MeshBuilder.CreateGround("gd", {width: 6, height: 6, subdivisions: 4 ,color: new BABYLON.Color3(1,.5,.5)}, scene);
   ground.color = BABYLON.Color3.Blue();
}

function CreateDice() {
    var options = {
        diameterTop:3, 
        diameterBottom: 6, 
        height: 5, 
        tessellation: 16, 
        subdivisions: 10
    }
    var cylinder = BABYLON.MeshBuilder.CreateCylinder("myCylinder", options);
}

var scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () { scene.render();});

    // Watch for browser/canvas resize events
window.addEventListener("resize", function () { engine.resize(); });