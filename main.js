window.addEventListener("load",_=>{
  const cvs = document.getElementById("canvas");
  const gl = cvs.getContext("webgl");

  gl.disable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.viewport(0,0,cvs.width,cvs.height);
  gl.clearColor(0,0,0.5,1);

  // vertices (for 2 triangle polygon)
  const verts = [
    -1,-1,
    -1,1,
    1,-1,
    1,1
  ];
  // Vertex Buffer Object (saved in GPU)
  const vbo = gl.createBuffer(); // create
  gl.bindBuffer(gl.ARRAY_BUFFER,vbo); // use 'vbo' as operation target
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW); // transfer verts to the GPU memory, assigned to 'vbo'

  // shader source (how to deal with and draw the polygon)
  const vertexShader = `
    // calculate screen position (4 dimension) of the vertex, from the vertex data (2 dimension (position))

    precision mediump float;
    attribute vec2 position;
    varying vec2 coord;
    uniform vec2 resolution;

    void main(void){
      coord = position * resolution / 2.;

      // gl_Position(x,y,z,w)
      // x,y is position relative to the screen (-1,-1)-(1,1)
      // z is ignored
      // w is a scaling factor (usually equals to z)
      gl_Position = vec4(position,0.,1.);
    }
  `;
  const fragmentShader = `
    // calculate pixel color of the position. current position is passed as 'coord'.

    precision mediump float;
    varying vec2 coord;
    uniform vec2 resolution;
    void main(void){
      // free to calculate!
      vec2 pos = coord / resolution.y;
      vec3 color = vec3(1,1,1);
      if (length(pos) < 0.4) color.xy = pos.xy*2.*0.5+0.5;

      // output color
      // w should be 1 (unless alpha enabled)
      gl_FragColor = vec4(color,1);
    }
  `;

  // making shaders
  const vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
  gl.shaderSource(vShader,vertexShader); // assign the shader source
  gl.compileShader(vShader); // compile
  if(!gl.getShaderParameter(vShader,gl.COMPILE_STATUS)){
    // If compilation failed
    console.error(gl.getShaderInfoLog(vShader));
    return;
  }

  // same procedures as vertex shader
  const fShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fShader,fragmentShader);
  gl.compileShader(fShader);
  if(!gl.getShaderParameter(fShader,gl.COMPILE_STATUS)){
    console.error(gl.getShaderInfoLog(fShader));
    return;
  }

  // program wraps shaders
  const program = gl.createProgram(); // create
  gl.attachShader(program,vShader); // attach vertex shader
  gl.attachShader(program,fShader); // attach fragment shader
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    // If link failed
    console.error(gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program); // declare using this program

  // obtain data to rewrite some variables
  gl.enableVertexAttribArray(0); // enable the first vertex property (called attribute)
  gl.bindAttribLocation(program,0,"position"); // declare that position is the first property of the vertex input
  gl.vertexAttribPointer(0,2,gl.FLOAT,false,8,0); // declare that the first parameter is consisted of two floats (and 1 vertex is consisted of 8 bytes (2*4bytes))
  const resolutionLocation = gl.getUniformLocation(program,"resolution"); // the place needed to rewrite the value of 'resolution'

  // rendering (in game, these operation will be repeated infinitely)
  gl.uniform2f(resolutionLocation,cvs.width,cvs.height); // set (cvs.width,cvs.height) as the value of 'resolution'
  gl.clear(gl.COLOR_BUFFER_BIT); // clear screen
  gl.bindBuffer(gl.ARRAY_BUFFER,vbo); // declare using the 'vbo'
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4); // rendering polygons
});
