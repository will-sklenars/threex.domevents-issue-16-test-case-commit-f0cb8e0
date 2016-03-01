function TargetGroup () {
  this.targets = this.createTargets()
}

TargetGroup.prototype.createTargets = function() {
  var targets = []
  coords = [
    new THREE.Vector3(0,0,0),
    new THREE.Vector3(0,2,0),
    new THREE.Vector3(2,0,0),
    new THREE.Vector3(2,2,0),

    new THREE.Vector3(0,0,2),
    new THREE.Vector3(0,2,2),
    new THREE.Vector3(2,0,2),
    new THREE.Vector3(2,2,2),
  ]

  _.forEach(coords, function (coord) {
    targets.push(
      new Cube({ position : coord })
    )
  })
  return targets
};