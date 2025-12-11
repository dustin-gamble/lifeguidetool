// Lightweight flight physics helper for the SLO flight simulator.
// Uses Cesium primitives; expects to be loaded after Cesium.js.
(function(global) {
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function stepFlightPhysics(state, input, dt, CesiumLib) {
        const {
            Math: CMath,
            Matrix3,
            Cartesian3,
            Transforms,
            HeadingPitchRoll,
            Cartographic
        } = CesiumLib;

        const turnInput = clamp(input.turn + input.joystickTurn, -1.5, 1.5);
        const pitchInput = clamp(input.pitch + input.joystickPitch, -1.2, 1.2);

        const turnRate = state.baseTurnRate; // radians per second
        const pitchRate = state.basePitchRate;

        state.heading = CMath.negativePiToPi(state.heading + turnRate * turnInput * dt);
        state.pitch = clamp(
            state.pitch + pitchRate * pitchInput * dt,
            state.minPitch,
            state.maxPitch
        );
        state.roll = clamp(-turnInput * state.rollAuthority, -CMath.PI_OVER_TWO, CMath.PI_OVER_TWO);

        state.speed = CMath.lerp(state.speedMin, state.speedMax, state.throttle);

        const hpr = new HeadingPitchRoll(state.heading, state.pitch, state.roll);
        const orientQuat = Transforms.headingPitchRollQuaternion(state.position, hpr);

        const orientMatrix = Matrix3.fromQuaternion(orientQuat);
        const forward = Matrix3.multiplyByVector(orientMatrix, Cartesian3.UNIT_X, new Cartesian3());

        Cartesian3.multiplyByScalar(forward, state.speed * dt, forward);
        state.position = Cartesian3.add(state.position, forward, new Cartesian3());

        const carto = Cartographic.fromCartesian(state.position);
        carto.height = clamp(carto.height, state.minAltitude, state.maxAltitude);
        state.position = Cartesian3.fromRadians(carto.longitude, carto.latitude, carto.height);

        state.orientation = orientQuat;
        state.cartographic = carto;
    }

    global.FlightPhysics = {
        step: stepFlightPhysics
    };
})(window);
