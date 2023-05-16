"use strict";

class Karcher {
    constructor(geometry) {
        this.geometry = geometry;
        this.vertexIndex = indexElements(geometry.mesh.vertices);
    }

    karcherCost(iB, weights) {
        let totalCost = 0;
        let base = this.geometry.positions[iB].unit();
        for (let iV = 0; iV < this.geometry.mesh.vertices.length; ++iV) {
            let angle = base.dot(this.geometry.positions[iV].unit());
            angle = Math.max(Math.min(angle, 1), -1);
            totalCost += Math.pow(weights.get(iV) * Math.acos(angle), 2);
        }
        return Math.sqrt(totalCost);
    }

	  compute(weights) {
        let phi = DenseMatrix.zeros(this.geometry.mesh.vertices.length, 1);

        for (let i = 0; i < this.geometry.mesh.vertices.length; i++) {
            phi.set(this.karcherCost(i, weights), i);
        }

        return phi;
    }
}
