// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    themeToggle.innerHTML = body.classList.contains('dark-mode') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
});

// Neural Network Visualization
class NeuralNetworkVisualizer {
    constructor() {
        this.canvas = document.getElementById('nnCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.animateConnections = true;
        this.showGrid = true;
        this.connectionProgress = 0;
        this.isAnimating = false;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = document.getElementById('networkCanvas');
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;
    }

    drawNeuron(x, y, isActive = false) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 20);
        gradient.addColorStop(0, isActive ? '#00ff9d' : '#4CAF50');
        gradient.addColorStop(1, isActive ? '#00cc7d' : '#45a049');

        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2, false);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Glow effect
        this.ctx.shadowColor = isActive ? '#00ff9d' : '#4CAF50';
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    drawConnection(x1, y1, x2, y2, progress = 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        
        if (this.animateConnections) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            this.ctx.lineTo(x1 + dx * progress, y1 + dy * progress);
        } else {
            this.ctx.lineTo(x2, y2);
        }

        this.ctx.strokeStyle = `rgba(0, 255, 157, ${progress * 0.6})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    calculateStats(layers) {
        const totalNeurons = layers.reduce((sum, count) => sum + count, 0);
        let totalConnections = 0;
        
        for (let i = 0; i < layers.length - 1; i++) {
            totalConnections += layers[i] * layers[i + 1];
        }

        document.getElementById('totalNeurons').textContent = totalNeurons;
        document.getElementById('totalConnections').textContent = totalConnections;
        
        const complexity = totalConnections > 100 ? 'Complex' : 
                          totalConnections > 50 ? 'Moderate' : 'Basic';
        document.getElementById('complexity').textContent = complexity;
    }

    draw(layers) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const layerSpacing = this.canvas.width / (layers.length + 1);
        const radius = 20;
        const verticalSpacing = 50;
        
        const layerCoordinates = [];
        
        // Calculate and store all neuron coordinates
        layers.forEach((neurons, layerIndex) => {
            const layerX = layerSpacing * (layerIndex + 1);
            const totalHeight = (neurons - 1) * (2 * radius + verticalSpacing);
            const startY = (this.canvas.height - totalHeight) / 2;
            
            const layerNeurons = [];
            for (let i = 0; i < neurons; i++) {
                layerNeurons.push({
                    x: layerX,
                    y: startY + i * (2 * radius + verticalSpacing)
                });
            }
            layerCoordinates.push(layerNeurons);
        });

        // Draw connections with animation
        if (this.animateConnections && !this.isAnimating) {
            this.isAnimating = true;
            this.connectionProgress = 0;
            const animate = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw connections
                for (let i = 0; i < layerCoordinates.length - 1; i++) {
                    const currentLayer = layerCoordinates[i];
                    const nextLayer = layerCoordinates[i + 1];
                    
                    currentLayer.forEach(neuron1 => {
                        nextLayer.forEach(neuron2 => {
                            this.drawConnection(
                                neuron1.x, neuron1.y,
                                neuron2.x, neuron2.y,
                                this.connectionProgress
                            );
                        });
                    });
                }
                
                // Draw neurons
                layerCoordinates.forEach((layer, layerIndex) => {
                    layer.forEach((neuron, neuronIndex) => {
                        this.drawNeuron(
                            neuron.x,
                            neuron.y,
                            Math.random() < 0.3 // Random activation effect
                        );
                    });
                });
                
                if (this.connectionProgress < 1) {
                    this.connectionProgress += 0.03;
                    requestAnimationFrame(animate);
                } else {
                    this.isAnimating = false;
                }
            };
            animate();
        } else if (!this.animateConnections) {
            // Draw static connections
            for (let i = 0; i < layerCoordinates.length - 1; i++) {
                const currentLayer = layerCoordinates[i];
                const nextLayer = layerCoordinates[i + 1];
                
                currentLayer.forEach(neuron1 => {
                    nextLayer.forEach(neuron2 => {
                        this.drawConnection(
                            neuron1.x, neuron1.y,
                            neuron2.x, neuron2.y,
                            1
                        );
                    });
                });
            }
            
            // Draw neurons
            layerCoordinates.forEach((layer, layerIndex) => {
                layer.forEach((neuron, neuronIndex) => {
                    this.drawNeuron(
                        neuron.x,
                        neuron.y,
                        Math.random() < 0.3
                    );
                });
            });
        }
    }
}

// Initialize the visualizer
const visualizer = new NeuralNetworkVisualizer();

// Form Controls
document.querySelectorAll('.control-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const target = e.target.dataset.target;
        const input = document.getElementById(target);
        const currentValue = parseInt(input.value);
        
        if (action === 'increase') {
            input.value = currentValue + 1;
        } else if (action === 'decrease' && currentValue > 1) {
            input.value = currentValue - 1;
        }
        
        if (target === 'hiddenLayers') {
            updateHiddenLayersInputs();
        }
    });
});

// Hidden Layers Input Generator
function updateHiddenLayersInputs() {
    const hiddenLayers = parseInt(document.getElementById('hiddenLayers').value);
    const container = document.getElementById('neuronsPerLayer');
    container.innerHTML = '';
    
    for (let i = 1; i <= hiddenLayers; i++) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = `Hidden Layer ${i} Neurons`;
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-with-controls';
        
        const decreaseBtn = document.createElement('button');
        decreaseBtn.type = 'button';
        decreaseBtn.className = 'control-btn';
        decreaseBtn.textContent = '-';
        decreaseBtn.dataset.action = 'decrease';
        decreaseBtn.dataset.target = `neuronsLayer${i}`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `neuronsLayer${i}`;
        input.min = '1';
        input.value = '3';
        input.required = true;
        
        const increaseBtn = document.createElement('button');
        increaseBtn.type = 'button';
        increaseBtn.className = 'control-btn';
        increaseBtn.textContent = '+';
        increaseBtn.dataset.action = 'increase';
        increaseBtn.dataset.target = `neuronsLayer${i}`;
        
        inputContainer.appendChild(decreaseBtn);
        inputContainer.appendChild(input);
        inputContainer.appendChild(increaseBtn);
        
        formGroup.appendChild(label);
        formGroup.appendChild(inputContainer);
        container.appendChild(formGroup);
    }
}

// Animation Toggle
document.getElementById('animateConnections').addEventListener('change', (e) => {
    visualizer.animateConnections = e.target.checked;
    visualizer.draw(getCurrentLayers());
});

// Grid Toggle
document.getElementById('showGrid').addEventListener('change', (e) => {
    const canvas = document.getElementById('networkCanvas');
    if (e.target.checked) {
        canvas.classList.remove('hide-grid');
    } else {
        canvas.classList.add('hide-grid');
    }
});

// Get current layer configuration
function getCurrentLayers() {
    const layers = [];
    layers.push(parseInt(document.getElementById('neuronsInput').value));
    
    const hiddenLayers = parseInt(document.getElementById('hiddenLayers').value);
    for (let i = 1; i <= hiddenLayers; i++) {
        layers.push(parseInt(document.getElementById(`neuronsLayer${i}`).value));
    }
    
    layers.push(parseInt(document.getElementById('neuronsOutput').value));
    return layers;
}

// Form submission handler
document.getElementById('nnForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const layers = getCurrentLayers();
    visualizer.calculateStats(layers);
    visualizer.draw(layers);
});

// Initial setup
updateHiddenLayersInputs();
document.getElementById('nnForm').dispatchEvent(new Event('submit'));