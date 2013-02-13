/*
 * Copyright (c) 2006-2007 Erin Catto http://www.gphysics.com
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */
interface Box2DBase extends Object {
    Common: B2Common;
    Dynamics: B2Dynamics;
    Collision: B2Collision;
}

interface B2World {
    CreateBody(def:B2BodyDef): B2Body;
    DestroyBody(body:B2Body) : void;
    GetBodyCount() : number;
    ClearForces() : void;
    Step(rate:number, velocity:number, position:number):void;
    SetDebugDraw(debug:B2DebugDraw): void;
    DrawDebugData(): void;
    GetGravity(): B2Vec2;
    SetGravity(B2Vec2) :void;
}

interface B2Common extends Object {
    Math: B2Math;
}

interface B2FixtureDef {
    shape: B2PolygonShape;
    density: number;
    friction: number;
    restitution: number;
}

interface B2PolygonShape {
    SetAsBox (width:number, height: number) : void;
}

interface B2AABB {
    lowerBound:B2Vec2;
    upperBound:B2Vec2;

    Combine(aabb1:B2AABB, aabb2:B2AABB):B2AABB;
    Contains(aabb:B2AABB):bool;
    GetCenter():B2Vec2;
    GetExtents():B2Vec2;
    IsValid():bool;
    RayCast(output:B2RayCastOutput, input:B2RayCastInput):bool;
    TestOverlap(other:B2AABB):bool;
}

interface B2FilterData {
    categoryBits:number;
    groupIndex:number;
    maskBits:number;
    Copy():B2FilterData;
}

interface B2MassData {
    center:B2Vec2;
    I:number;
    mass:number;
}

interface B2RayCastInput {
    maxFraction:number;
    p1:B2Vec2;
    p2:B2Vec2;

    (p1:B2Vec2, p2:B2Vec2, maxFraction:number):B2RayCastInput;
}

interface B2RayCastOutput {
    fraction:number;
    normal: B2Vec2;
}

interface B2Shape {
    ComputeAABB(aabb:B2AABB, xf:B2Transform):void;
    ComputeMass(massData:B2MassData, density:number):void;
    ComputeSubmergedArea(normal:B2Vec2, offset:number, xf:B2Transform, c2:B2Vec2):number;
    Copy():B2Shape;
    GetType():number;
    RayCast(output:B2RayCastOutput, input:B2RayCastInput,transform:B2Transform):bool;
    Set(other:B2Shape):void;
    TestPoint(xf:B2Transform, p:B2Vec2):bool;
}

interface B2Fixture {
    GetAABB(): B2AABB;
    GetBody(): B2Body;
    GetDensity(): number;
    GetFilterData():B2FilterData;
    GetFriction():number;
    GetMassData():B2MassData;
    GetNext():B2Fixture;
    GetRestitution():number;
    GetShape():B2Shape;
    GetType():number;
    GetUserData():any;
    IsSensor():bool;
    RayCast(output:B2RayCastOutput, input:B2RayCastInput):bool;
    SetDensity(density:number):void;
    SetFilterData(filter:B2FilterData):void;
    SetFriction(friction:number):void;
    SetRestitution(restitution:number):void;
    SetSensor(sensor:bool):void;
    SetUserData(data:any):void;
    TestPoint(p:B2Vec2):bool;
}

interface B2Body extends Object {
    b2_staticBody:number;
    b2_dynamicBody:number;
    b2_kinematicBody:number;
    ApplyForce(force:B2Vec2, point:B2Vec2):void;
    ApplyImpulse(impulse:B2Vec2, point:B2Vec2):void;
    ApplyTorque(torque:number):void;
    CreateFixture(def:B2FixtureDef):B2Fixture;
    CreateFixture2(shape:B2Shape, density:number):B2Fixture;
    DestroyFixture(fixture:B2Fixture):void;
    GetAngle():number;
    GetAngularDamping():number;
    GetContactList():B2ContactEdge;
    GetControllerList():B2ControllerEdge;
    GetDefinition():B2BodyDef;
    GetFixtureList():B2Fixture;
    GetInertia():number;
    GetJointList():B2JointEdge;
    GetLinearDamping():number;
    GetLInearVelocity():B2Vec2;
    GetLinearVelocityFromLocalPoint(localPoint:B2Vec2):B2Vec2;
    GetLinearVelocityFromWorldPoint(worldPoint:B2Vec2):B2Vec2;
    GetLocalCenter():B2Vec2;
    GetLocalPoint(worldPoint:B2Vec2):B2Vec2;
    GetLocalVector(worldVector:B2Vec2):B2Vec2;
    GetMass():number;
    GetMassData(data:B2MassData):void;
    GetNext():B2Body;
    GetPosition():B2Vec2;
    GetTransform():B2Transform;
    GetType():number;
    GetUserData():any;
    GetWorld():B2World;
    GetWorldCenter():B2Vec2;
    GetWorldPoint(localPoint:B2Vec2):B2Vec2;
    GetWorldVector(localPoint:B2Vec2):B2Vec2;
    IsActive():bool;
    IsAwake():bool;
    IsBullet():bool;
    IsFixedRotation():bool;
    Merge(other:B2Body):void;
    ResetMassData():void;
    SetActive(flag:bool):void;
    SetAngle(angle:number):void;
    SetAngularDamping(angularDamping:number):void;
    SetAwake(flag:bool):void;
    SetBullet(flag:bool):void;
    SetFixedRotation(fixed:bool):void;
    SetLinearDamping(linearDamping:number):void;
    SetMassData(massData:B2MassData):void;
    SetPosition(position:B2Vec2):void;
    SetPositionAndAngle(position:B2Vec2, angle:number):void;
    SetSleepingAllowed(flag:bool):void;
    SetTransform(xf:B2Transform):void;
    SetType(type:number):void;
    SetUserData(data:any):void;
    Split(callback:(fixture:B2Fixture) => bool):B2Body;
}

declare interface B2Transform {
    position:B2Vec2;
    R:B2Mat22;
    (position:B2Vec2, R:B2Vec2):B2Transform;
    GetAngle():number;
    Initialize(pos:B2Vec2, r:B2Mat22):void;
    Set(x:B2Transform):void;
    SetIdentity():void;
}

declare interface B2BodyDef extends Object {
    type: number;
    position: B2Vec2;
}

declare interface B2Dynamics extends Object {
    b2BodyDef: {
        new () : B2BodyDef;
    };
    b2Body:any;
    b2FixtureDef: {
        new () : B2FixtureDef;
    };
    b2World:B2World;
    b2DebugDraw:B2DebugDraw;
    b2FilterData:{ new (): B2FilterData;};
    b2ContactEdge:B2ContactEdge;
    Contacts: {
        b2Contact:B2Contact;
        b2ContactEdge:B2ContactEdge;
        b2ContactResult:B2ContactResult;
    };
}

interface B2Vec2 {
    x:number;
    y:number;

    (x:number, y:number):B2Vec2;
    Abs():void;
    Add(v:B2Vec2):void;
    Copy():B2Vec2;
    CrossFV(s:number);
    CrossVF(s:number);
    GetNegative():B2Vec2;
    IsValid():bool;
    Length():number;
    LengthSquared():number;
    Make(x:number, y:number):B2Vec2;
    MaxV(b:B2Vec2):void;
    MinV(b:B2Vec2):void;
    MulM(A:B2Mat22):void;
    Multiply(a:number):void;
    MulTM(A:B2Mat22):void;
    NetativeSelf():void;
    Normalize():number;
    Set(x:number, y:number):void;
    SetV(v:B2Vec2):void;
    SetZero():void;
    Subtract(v:B2Vec2):void;
}

interface B2Mat22 {
    col1:B2Vec2;
    col2:B2Vec2;

    ():B2Mat22;
    Abs():void;
    AddM(m:B2Mat22):void;
    Copy():B2Mat22;
    GetAngle():number;
    GetInverse(out:B2Mat22):B2Mat22;
    Set(angle:number):void;
    SetIdentity():void;
    SetM(m:B2Mat22):void;
    SetVV(c1:B2Vec2, c2:B2Vec2):void;
    SetZero():void;
    Solve(out:B2Vec2, bX:number, bY:number):B2Vec2;
}

interface B2Math extends Object {
    b2Vec2 : {
        new (x:number, y:number):B2Vec2;
        Make(x:number, y:number):B2Vec2;
    };
    b2Mat22: {
        FromAngle(angle:number):B2Mat22;
        FromVV(c1:B2Vec2, c2:B2Vec2):B2Mat22;
    };
    b2Transform:B2Transform;
}

interface B2Collision extends Object {
    Shapes : B2Shapes;
    b2RayCastInput: B2RayCastInput;
    b2RayCastOutput: B2RayCastOutput;
    b2AABB:B2AABB;
    b2ContactID:B2ContactID;
}

interface B2Shapes extends Object {
    b2MassData : B2MassData;
    b2PolygonShape: {new (): B2PolygonShape;};
    b2CircleShape: any;
    b2Shape: {TestOverlap(shape1:B2Shape, transform1:B2Transform,
                          shape2:B2Shape, transform2:B2Transform):bool;
             };
}

interface B2ContactEdge {
    contact:B2Contact;
    next:B2ContactEdge;
    other:B2Body;
    prev:B2ContactEdge;
}

interface B2Manifold {
    m_localPlaneNormal:B2Vec2;
    m_localPoint:B2Vec2;
    m_pointCount:number;
    m_points:B2Vec2[];
    m_type:number;

    ():B2Manifold;
    Copy():B2Manifold;
    Reset():void;
    Set(m:B2Manifold):void;

    e_circles:number;
    e_faceA:number;
    e_faceB:number;
}

interface B2WorldManifold {
    m_normal:B2Vec2;
    m_points:B2Vec2[];

    ():B2WorldManifold;
    Initialize(manifold:B2Manifold, xfA:B2Transform, radiusA:number, xfB:B2Transform,
               radiusB:number):void;
}

interface B2ControllerEdge {
    body:B2Body;
    controller:B2Controller;
    nextBody:B2ControllerEdge;
    nextConroller:B2Controller;
    prevBody:B2ControllerEdge;
    prevConroller:B2Controller;
}

interface B2Controller {
    m_bodyCount:number;
    m_bodyList:B2ControllerEdge;

    AddBody(body:B2Body):void;
    Clear():void;
    Draw(debugDraw:B2DebugDraw):void;
    GetBodyList():B2ControllerEdge;
    GetNext():B2Controller;
    GetWorld():B2World;
    RemoveBody(body:B2Body):void;
    Step(step:any):void;
}

interface B2Joint {
    GetAnchorA():B2Vec2;
    GetAnchorB():B2Vec2;
    GetBodyA():B2Body;
    GetBodyB():B2Body;
    GetNext():B2Joint;
    GetReactionForce(inv_dt:number):B2Vec2;
    GetReaactionTorque(inv_dt:number):number;
    GetType():number;
    GetUserData():any;
    IsActive():bool;
    SetUserData(data:any):void;
}

interface B2JointEdge {
    joint:B2Joint;
    next:B2JointEdge;
    other:B2Body;
    prev:B2JointEdge;
}

interface B2ContactID {
    features: any;
    key:number;
    ():B2ContactID;
    Copy():B2ContactID;
    Set(id:B2ContactID):void;
}

interface B2ContactResult {
    id:B2ContactID;
    normal:B2Vec2;
    normalImpulse:number;
    position:B2Vec2;
    shape1:B2Shape;
    shape2:B2Shape;
    tangentImpulse:number;
}

interface B2Contact {
    ():B2Contact;
    FlagForFiltering():void;
    GetFixtureA():B2Fixture;
    GetFixtureB():B2Fixture;
    GetManifold():B2Manifold;
    GetNext():B2Contact;
    GetWorldManifold(worldManifold:B2WorldManifold):void;
    IsContinuous():bool;
    IsEnabled():bool;
    IsSensor():bool;
    IsTouching():bool;
    SetEnabled(flag:bool):void;
    SetSensor(flag:bool):void;
}

interface B2Color {
    b:number;
    color:number;
    g:number;
    r:number;

    (r:number, g:number, b:number):B2Color;
    Set(r:number, g:number, b:number):void;
}

interface B2DebugDraw {

    ():B2DebugDraw;
    AppendFlags(flags:number):void;
    ClearFlags(flags:number):void;
    DrawCircle(center:B2Vec2, radius:number, color:B2Color):void;
    DrawPolygon(vertices:B2Vec2[], vertexCount:number, color:B2Color):void;
    DrawSegment(p1:B2Vec2, p2:B2Vec2, color:B2Color):void;
    drawSolidCircle(center:B2Vec2, radius:number, axis:B2Vec2, color:B2Color):void;
    DrawSolidPolygon(vertices:B2Vec2[], vertexCount:number, color:B2Color):void;
    DrawTransform(xf:B2Transform):void;
    GetAlpha():number;
    GetDrawScale():number;
    GetFillAlpha():number;
    GetFlags():number;
    GetLineThickness():number;
    GetSprite():any;
    GetXFormScale():number;
    SetAlpha(alpha:number):void;
    SetFillAlpha(alpha:number):void;
    SetDrawScale(drawScale:number):void;
    SetFlags(flags:number):void;
    SetLineThickness(lineThickness:number):void;
    SetSprite(sprite:any):void;
    SetXFoprmScale(xfomScale:number):void;
}

declare var Box2D : {
    Common:B2Common;
    Dynamics: {
        b2Body: {
            b2_staticBody: number;
            b2_dynamicBody: number;
        };
        b2FixtureDef : {new (): B2FixtureDef;};
        b2BodyDef: {new (): B2BodyDef;};
        b2World: {new (gravity:B2Vec2, sleep:bool) : B2World;};
        b2DebugDraw: {new (): B2DebugDraw;
                      e_aabbBit:number;
                      e_centerOfMassBit:number;
                      e_controllerBit: number;
                      e_jointBit:number;
                      e_pairBit:number;
                      e_shapeBit:number;
                     };
    };
    Collision:B2Collision;
};
