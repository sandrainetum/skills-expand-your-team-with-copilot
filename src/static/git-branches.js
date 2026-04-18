/**
 * Animated Git-style branch lines background for Mergington High School
 * Draws slowly-moving branch nodes and connections in school colors.
 */
(function () {
  const canvas = document.getElementById("git-branches-canvas");
  const ctx = canvas.getContext("2d");

  // School colors: lime green palette
  const COLORS = [
    "rgba(76, 175, 80, 0.35)",
    "rgba(128, 226, 126, 0.3)",
    "rgba(8, 127, 35, 0.25)",
    "rgba(46, 125, 50, 0.3)",
    "rgba(165, 214, 167, 0.35)",
  ];

  // How many branch "lanes" (columns) to draw
  const LANE_COUNT = 6;
  const NODE_RADIUS = 5;
  const SPEED = 0.3; // pixels per frame (slow drift)

  let width, height;
  let lanes = [];

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initLanes();
  }

  /**
   * Each lane is a vertical track with nodes that drift downward.
   * Branches connect adjacent lanes with diagonal lines.
   */
  function initLanes() {
    lanes = [];
    const laneWidth = width / (LANE_COUNT + 1);

    for (let i = 0; i < LANE_COUNT; i++) {
      const x = laneWidth * (i + 1);
      const color = COLORS[i % COLORS.length];
      const nodes = [];

      // Spread nodes vertically across the canvas, including above/below viewport
      const spacing = 100 + Math.random() * 80;
      let y = -200 + Math.random() * spacing;
      while (y < height + 300) {
        nodes.push({
          x: x + (Math.random() - 0.5) * 20,
          y,
          hasBranch: Math.random() < 0.3, // 30% chance to branch to adjacent lane
          branchDir: Math.random() < 0.5 ? -1 : 1, // left or right
          opacity: 0.5 + Math.random() * 0.5,
        });
        y += spacing + Math.random() * 60;
      }

      lanes.push({ x, color, nodes, speed: SPEED * (0.7 + Math.random() * 0.6) });
    }
  }

  function drawLanes() {
    ctx.clearRect(0, 0, width, height);

    for (let li = 0; li < lanes.length; li++) {
      const lane = lanes[li];
      const nodes = lane.nodes;

      // Draw connecting lines between consecutive nodes
      for (let ni = 0; ni < nodes.length - 1; ni++) {
        const a = nodes[ni];
        const b = nodes[ni + 1];

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = lane.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // If this node branches, draw a diagonal line to an adjacent lane
        if (a.hasBranch) {
          const targetLaneIdx = Math.max(0, Math.min(lanes.length - 1, li + a.branchDir));
          const targetLane = lanes[targetLaneIdx];
          // Find the nearest node in the target lane by y position
          const midY = (a.y + b.y) / 2;
          const targetNode = targetLane.nodes.reduce((closest, n) =>
            Math.abs(n.y - midY) < Math.abs(closest.y - midY) ? n : closest
          );

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.bezierCurveTo(
            a.x, a.y + 40,
            targetNode.x, targetNode.y - 40,
            targetNode.x, targetNode.y
          );
          ctx.strokeStyle = lane.color;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Draw nodes as small circles
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = lane.color.replace(/[\d.]+\)$/, `${node.opacity})`);
        ctx.fill();
        ctx.strokeStyle = lane.color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  function update() {
    for (const lane of lanes) {
      for (const node of lane.nodes) {
        node.y += lane.speed;
      }

      // Recycle nodes that drift off the bottom, back to the top
      for (const node of lane.nodes) {
        if (node.y > height + 50) {
          node.y = -150 + Math.random() * 50;
          node.x = lane.x + (Math.random() - 0.5) * 20;
          node.hasBranch = Math.random() < 0.3;
          node.branchDir = Math.random() < 0.5 ? -1 : 1;
        }
      }
    }
  }

  function loop() {
    update();
    drawLanes();
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  loop();
})();
