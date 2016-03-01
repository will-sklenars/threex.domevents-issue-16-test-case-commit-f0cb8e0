$(document).on('ready', function () {

  function Environment () {
    this.container = document.getElementById( "container" );
    this.scene = new THREE.Scene();
    this.onRenderFcts = []
  }

  Environment.prototype.init = function () {
    var self = this
    /////////////////////////// set up camera ///////////////////////////////////////
    this.initializeCamera()
    /////////////////////////// set up controls /////////////////////////////////////
    // this.initializeControls()
    /////////////////////////// set up renderer /////////////////////////////////////
    this.initializeRenderer()
    ///////////////////// On Window Resize //////////////////////////////////////////
    this.initWindowResize()
    ///////////////////////////////////// Dom Events ////////////////////////////////
    this.domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement)
    ///////////////////////////////////// Stats /////////////////////////////////////
    this.initStats()
    this.initRendererStats()
    ///////////////////////////////////// axisHelper /////////////////////////////////////
    this.initAxisHelper()
    //////////////////////////////////// INIT DOLLY ZOOM ////////////////////////////////

    /////////////////////// render the scene ////////////////////////////////////////
    this.onRenderFcts.push(function(){
      self.renderer.render( self.scene, self.camera );
    })

  }

  Environment.prototype.initAxisHelper = function() {
    this.axisHelper = new THREE.AxisHelper( 50 );
    this.addObjectToScene( this.axisHelper )
  };

  Environment.prototype.populateScene = function () {
    var self = this
    this.targetGroup = new TargetGroup()
    this.addObjectsToScene(this.targetGroup.targets)
    _.forEach(this.targetGroup.targets, self.addListner.bind(this))

    this.dollyZoom = new DollyZoom({ environment : this })

    $(document).on('keypress', function (event) {
      var keyCode = event.keyCode
      if ( keyCode == 111 || keyCode == 79 ) {
        console.log('out')
        self.dollyZoom.out()
      }
      if ( keyCode == 105 || keyCode == 73 ) {
        console.log('in')
        self.dollyZoom.in()
      }
    })
  }

  Environment.prototype.addListner = function (cube) {
    var mesh = cube.mesh
    this.domEvents.addEventListener(mesh, 'click', function(){
      console.log('hit!')
    }, false)

    this.domEvents.addEventListener(mesh, 'mouseover', function(){
      $('#container').addClass('threejs-hover')
    }, false)

    this.domEvents.addEventListener(mesh, 'mouseout', function(){
      $('#container').removeClass('threejs-hover')
    }, false)
  }



  Environment.prototype.animate = function () {
  }

  Environment.prototype.render = function () {

    var self = this
    var lastTimeMsec = null
    requestAnimationFrame(function animate(nowMsec){

      // keep looping
      requestAnimationFrame( animate );

      // measure time
      lastTimeMsec  = lastTimeMsec || nowMsec-1000/60
      var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
      lastTimeMsec  = nowMsec

      // call each update function
      self.onRenderFcts.forEach(function(onRenderFct){
        onRenderFct(deltaMsec/1000, nowMsec/1000)
      })


      // update TWEEN functions
      TWEEN.update(nowMsec);

    })
  }


  /////////////////////////////////////////////////////////////////////
  ///////////////////////////// init fxns /////////////////////////////
  /////////////////////////////////////////////////////////////////////


  Environment.prototype.initializeCamera = function () {
    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.0001, 10000 );
    // this.camera.position.set(1,1,4.5)
    this.camera.position.set(-4,1,1)
    this.camera.lookAt(new THREE.Vector3(1,1,1))
  }

  Environment.prototype.initializeControls = function () {
    this.controls = new THREE.OrbitControls( this.camera, this.container );
    // this.controls.maxDistance = 5
    this.controls.minDistance = 1.7
    this.controls.zoomSpeed = 0.2
    this.controls.target.set(1,1,1)
    this.controls.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE };
    this.controls.enableKeys = false
  }

  Environment.prototype.initializeRenderer = function () {
    var self = this

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setClearColor( 0x222628 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.sortObjects = false;
    this.renderer.rendering = true
    this.container.appendChild( this.renderer.domElement );
  }

  Environment.prototype.initWindowResize = function () {
    this.windowResize = new THREEx.WindowResize(this.renderer, this.camera)
  }

  Environment.prototype.initStats = function () {
    var self = this
    this.stats = new Stats();
    this.stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
    // align top-left
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';
    document.body.appendChild( this.stats.domElement );
    var $stats = $(this.stats.domElement)
    $stats.hide()
    this.onRenderFcts.push(function () {
      self.stats.begin();
      self.stats.end();
    })

    $(document).on('keypress', function (e) {
      if ( e.keyCode === 115 || e.keyCode === 83) {
        $stats.toggle()
      }
    })
  }

  Environment.prototype.initRendererStats = function  () {
    var self = this
    this.rendererStats   = new THREEx.RendererStats()

    this.rendererStats.domElement.style.position = 'absolute'
    this.rendererStats.domElement.style.right = '0px'
    this.rendererStats.domElement.style.top   = '0px'
    document.body.appendChild( this.rendererStats.domElement )

    var $rendererStats = $(this.rendererStats.domElement)
    $rendererStats.hide()

    this.onRenderFcts.push(function () {
      self.rendererStats.update(self.renderer);
    })

    $(document).on('keypress', function (e) {
      if ( e.keyCode === 115 || e.keyCode === 83) {
        $rendererStats.toggle()
      }
    })
  }



  ///////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////// UTILITIES ////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////

  ///////////////////////// adding & removing objects from scene /////////////////////////////////

  Environment.prototype.addObjectsToScene = function (objects) {
    _.forEach(objects, this.addObjectToScene.bind(this))
  }

  Environment.prototype.addObjectToScene = function (object) {
    if (object.mesh) {
      this.scene.add(object.mesh)
    } else {
      this.scene.add(object)
    }
  }

  Environment.prototype.removeObjectFromScene = function (object) {
    this.scene.remove( object.mesh )
  }

  Environment.prototype.removeObjectsFromScene = function (objects) { // duplicate of ebove function
    _.forEach( objects, this.removeObjectFromScene.bind(this) )
  }

  //////////////////////////////////// billboarding ////////////////////////////////////////////////

  Environment.prototype.billboardObjects = function (objects) {
    _.forEach(objects, this.billboardObject.bind(this))
  }

  Environment.prototype.billboardObject = function (object) {
    object.mesh.quaternion.copy( this.camera.quaternion )
  }

  var environment = new Environment()

  environment.init()

  environment.populateScene()

  environment.animate()

  environment.render()









})