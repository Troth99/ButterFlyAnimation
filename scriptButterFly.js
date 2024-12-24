let animation_render = {
    initialize: function () {
        this.setUpCanvas();
        this.setupVariables();
        this.animate();
    },

    setUpCanvas: function () {
        this.canvasContainer = document.getElementById("butterfly")
        this.canvasWidth = this.canvasContainer.clientWidth;
        this.canvasHeight = this.canvasContainer.clientHeight;
        
        let canvas = document.createElement("canvas");
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;

        this.canvasContainer.appendChild(canvas);

        this.canvasContext = canvas.getContext('2d')

        this.creatures = [new FLIGHT_CREATURE(this)];
        this.particles = [];
        this.spawnRate = this.randomValue(150, 300)
    },
    setupVariables: function () {
        this.animate = this.animate.bind(this);
    },
    randomValue: function (min, max) {
        return min + (max - min) * Math.random();
    },

    animate: function () {
        requestAnimationFrame(this.animate);

        let context = this.canvasContext;
        context.save()

        context.fillStyle = "rgba(0, 0, 0, 0.3)";
        context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        context.globalCompositeOperation = "lighter";

        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].render(context)) {
                this.particles.splice(i, 1)
            }
        }
        context.restore()

        for (let i = this.creatures.length - 1; i >= 0; i--) {
            if (!this.creatures[i].render(context)) {
                this.creatures.splice(i, 1);
            }
        }

        if (--this.spawnRate < 0) {
            this.spawnRate = this.randomValue(300, 600);
            this.creatures.push(new FLIGHT_CREATURE(this));
        }
    },
};

let FLIGHT_CREATURE = function (renderer) {
    this.renderer = renderer;
    this.initialize();
}

FLIGHT_CREATURE.prototype = {
    deltaAngle: Math.PI / 60,
    movementSpeed: 2,
    spawnThreeShold: 120,
    heartProgress: 0,
    isFlyingAway: false,

    initialize: function () {

        this.angle = 0;
        this.parameter = 0;
        this.positionX = this.renderer.canvasWidth /2
        this.positionY = this.renderer.canvasHeight 
        this.velocityX = 0;
        this.velocityY = -2;
        this.swingFactor = this.renderer.randomValue(0.5, 1)
        this.movementSpeed = 1
       
    },

    createParticles: function () {
        for (let i = 0; i < 3; i++) {
            this.renderer.particles.push(new PARTICLE(this.renderer, this.positionX, this.positionY))
        }
        return this.positionY >= this.spawnThreeShold;
    },

    render: function (context) {
        this.angle += 0.02
        if (!this.isFlyingAway){
            this.positionX = 175 * Math.pow(Math.sin(this.parameter), 3) + this.renderer.canvasWidth / 2;
            this.positionY = -13 * Math.cos(this.parameter) + 185 * Math.cos(2 * this.parameter) + 50 * Math.cos(3 * this.parameter) + 5 * Math.cos(4 * this.parameter) + this.renderer.canvasHeight / 2;
            
            
        
      
        this.parameter += 0.01;

            if(this.heartProgress > Math.PI * 2){
                this.heartProgress = 0;
                this.isFlyingAway = true;
            }
        }else {
            this.positionY -= 2
        }
       
     
     


        
        this.createParticles();
    
    
        context.save();
        context.translate(this.positionX, this.positionY);
        context.rotate(Math.atan2(this.velocityX, -this.velocityY) / 12);
        this.drawWings(context);
        context.restore();
    
    
        if (this.positionY < 0 || this.positionY > this.renderer.canvasHeight || this.positionX < 0 || this.positionX > this.renderer.canvasWidth) {
            return false;
        }
        return true;
    },




    drawWings: function (context) {
        for (let i = -1; i <= 1; i += 2) {
            context.save()
            context.scale(i, 1);

            let gradient = context.createRadialGradient(0, 0, 0, 0, 0, 70),
                wingEffect = Math.sin(this.angle / 5);
            gradient.addColorStop(0, "hsl(280, 70%, 45%)");
            gradient.addColorStop(0.3, "hsl(280, 70%, " + (45 + 10 * wingEffect) + "%)");
            gradient.addColorStop(0.5, "hsl(280, 70%, " + (45 + 20 * wingEffect) + "%)");
            gradient.addColorStop(1, "hsl(280, 70%, " + (45 + 30 * wingEffect) + "%)");

            context.lineWidth = 4;
            context.strokeStyle = "hsl(280, 70%, 80%)";
            context.fillStyle = gradient;


            context.save();
            context.scale(0.8 + 0.2 * Math.cos(this.angle + Math.PI / 12), 1);
            context.beginPath();
            context.moveTo(-4, 0);
            context.bezierCurveTo(-45, -15, -65, 25, -35, 50);
            context.bezierCurveTo(-25, 60, -15, 60, -4, -6);
            context.closePath();
            context.fill();
            context.stroke();
            context.restore();

            context.save();
            context.scale(0.8 + 0.2 * Math.cos(this.angle), 1);
            context.beginPath();
            context.moveTo(-4, -6);
            context.bezierCurveTo(-27, -65, -80, -60, -70, -40);
            context.bezierCurveTo(-60, -15, -70, 5, -4, 0);
            context.closePath();
            context.fill();
            context.stroke();
            context.restore();

            context.lineWidth = 3;
            context.strokeStyle = "hsl(280, 70%, 80%)";
            context.beginPath();
            context.moveTo(-3, -12);
            context.bezierCurveTo(
                -6,
                -22,
                -4 - Math.sin(this.angle),
                -35,
                -9 - Math.sin(this.angle),
                -45
            );
            context.stroke();
            context.restore();
        }
        context.restore();
    },
};


let PARTICLE = function (renderer, x, y){
    this.renderer = renderer;
    this.positionX = x;
    this.positionY = y;
    this.initialize();
};

PARTICLE.prototype = {
    friction: 0.98,
    size: 3,
    decreaseOpacity: 0.004,

    initialize: function(){
        this.positionX += this.renderer.randomValue(-60, 60);
        let direction = this.renderer.randomValue(0, Math.PI * 2);
        this.velocityX = Math.cos(direction);
        this.velocityY = Math.sin(direction);
        this.opacity = 1;
    },
    render: function( context){
        context.save();
        context.translate(this.positionX, this.positionY);
        context.scale(2 - this.opacity, 2 - this.opacity);
        context.beginPath();

        context.fillStyle = "hsla(280, 100%, 65%, " + this.opacity + ")";
        context.arc(0, 0, this.size, 0 , Math.PI *2, false);
        context.fill()
        context.restore();

        this.positionX += this.velocityX;
        this.positionY += this.velocityY;
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;
        this.opacity = Math.max(0, this.opacity - this.decreaseOpacity);

        return this.opacity > 0
    },
}

animation_render.initialize()








