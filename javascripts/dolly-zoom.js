function DollyZoom(opts) {
  this.environment = opts.environment
  this.focalPoint = new THREE.Vector3(1,1,1)
  this.nearDestination = new THREE.Vector3(-4,1,1)
  this.farDestination = new THREE.Vector3(-3004.2,1,1)
}

DollyZoom.prototype.out = function() {
  var self = this
  this.dollyZoom({
    destination : self.farDestination,
    duration : 3000
  })
};

DollyZoom.prototype.in = function() {
  var self = this
  this.dollyZoom({
    destination : self.nearDestination,
    duration : 3000
  })
};

DollyZoom.prototype.dollyZoom = function (opts) {

  var self = this

  var tween

  var camera = this.environment.camera
  var focalPoint = this.focalPoint

  var screenHeight = findHeight({
    distance : camera.position.distanceTo(focalPoint),
    vFOV : camera.fov
  })

  var destination = opts.destination

  var currentDistance = camera.position.distanceTo(focalPoint)
  var newDistance = destination.distanceTo(focalPoint)
  var easing
  if (newDistance > currentDistance) {
    // self.dollyZoomed = true
    easing = TWEEN.Easing.Quartic.In
  } else {
    // self.dollyZoomed = false
    easing = TWEEN.Easing.Quartic.Out
  }

  var newX = destination.x
  var newy = destination.y
  var newZ = destination.z

  var tweenIncrementors = {
    x : camera.position.x,
    y : camera.position.y,
    z : camera.position.z
  }

  var tween = new TWEEN.Tween(tweenIncrementors)
      .to({
        x : newX,
        y : newy,
        z : newZ
      }, opts.duration)
      .easing(easing)
      .onUpdate(function () {
        camera.position.set(tweenIncrementors.x, tweenIncrementors.y, tweenIncrementors.z)
        camera.lookAt(focalPoint)

        var newVFOV = findVFOV({
          depth : camera.position.distanceTo(focalPoint),
          height : screenHeight,
        })

        camera.fov = newVFOV
        camera.updateProjectionMatrix()
      })
      .start();
  return tween
}

function findVFOV(opts) {
  var angleRadians = 2 * Math.atan(opts.height / (2*opts.depth) )
  var angleDegrees = radiansToDegrees(angleRadians)
  return angleDegrees
}

function findHeight(opts) {
  var vFOV = degreesToRadians(opts.vFOV)
  var height = 2 * opts.distance * Math.tan(vFOV/2)
  return height
}


function degreesToRadians(degrees) {
  return degrees * Math.PI /180
}
function radiansToDegrees(radians) {
  return radians * 180 / Math.PI
}

