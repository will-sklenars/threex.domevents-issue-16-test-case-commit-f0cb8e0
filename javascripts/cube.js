function Cube (opts) {
  this.mesh = this.createMesh(opts)
}

Cube.prototype.createMesh = function(opts) {

  var geometry = new THREE.BoxGeometry( 0.3, 0.3, 0.3 )

  var material = new THREE.MeshNormalMaterial({})

  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(opts.position)
  return mesh
};