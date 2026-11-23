# Calculus (VIT Vellore, Sem 1): 8-Hour Crash Course

> How to use this: each module has (1) the formulas you must know, (2) the method as steps, (3) worked exam-style examples with answers, and (4) "PYQ pattern" notes. Solve every worked example yourself first, then check the answer. I checked each answer by hand.

---

## The 8-hour plan

| Time | What | Why |
|---|---|---|
| 0:00 – 1:30 | **Module I**: Jacobian, Taylor, Maxima/Minima, Lagrange | Easy marks. Maxima/minima and Lagrange show up almost every time |
| 1:30 – 3:00 | **Module II**: Change of order, Polar, Cylindrical/Spherical | Draw the region first and the rest is mechanical |
| 3:00 – 3:15 | Break | |
| 3:15 – 4:45 | **Module III**: grad/div/curl, potential, Green/Stokes/Gauss | "Verify Green's/Gauss/Stokes" is a long question that appears often |
| 4:45 – 6:00 | **Module IV**: Undetermined coefficients, Variation of parameters, Cauchy-Euler | Pure method, so it scores well |
| 6:00 – 6:15 | Break | |
| 6:15 – 7:30 | **Module V**: Lagrange's linear PDE, 4 standard types, Clairaut, Separation of variables | Each type has its own fixed trick |
| 7:30 – 8:00 | Re-read the **formula sheet** at the bottom and redo one example per topic | |

---

# MODULE I: Differential Calculus of Several Variables

## 1. Jacobian

**Definition:** for u = u(x,y) and v = v(x,y),

```
J = ∂(u,v)/∂(x,y) = | u_x  u_y |
                    | v_x  v_y |
```
The 3×3 case works the same way.

**Properties (often asked as "prove" questions):**
1. **J · J′ = 1**, that is, ∂(u,v)/∂(x,y) · ∂(x,y)/∂(u,v) = 1
2. **Chain rule:** ∂(u,v)/∂(x,y) = ∂(u,v)/∂(r,s) · ∂(r,s)/∂(x,y)
3. **Functional dependence:** u and v are functionally dependent ⇔ J = 0. If so, find the relation between them.

**Standard Jacobians (memorise):**
| Transformation | Jacobian |
|---|---|
| Polar: x = r cosθ, y = r sinθ | **r** |
| Cylindrical: x = r cosθ, y = r sinθ, z = z | **r** |
| Spherical: x = r sinθ cosφ, y = r sinθ sinφ, z = r cosθ | **r² sinθ** |

**Worked example:** if u = x + y + z, uv = y + z, uvw = z, find ∂(x,y,z)/∂(u,v,w).
- Solve for x, y, z: z = uvw, y = uv − uvw, x = u − uv.
- J = | 1−v  −u  0 ; v−vw  u−uw  −uv ; vw  uw  uv |
- Add row 3 to row 2, then rows 2 and 3 to row 1. This simplifies to **J = u²v**.

**Worked example (dependence):** u = (x+y)/(1−xy), v = tan⁻¹x + tan⁻¹y.
- Here J = 0, so u and v are dependent. The relation is **u = tan v**.

---

## 2. Taylor's Series (two variables)

About the point (a, b), with h = x − a and k = y − b:

```
f(x,y) = f(a,b) + [h f_x + k f_y]
       + (1/2!)[h² f_xx + 2hk f_xy + k² f_yy]
       + (1/3!)[h³ f_xxx + 3h²k f_xxy + 3hk² f_xyy + k³ f_yyy] + …
```
(all derivatives evaluated at (a, b)). Maclaurin is the special case a = b = 0.

**Method:** make a table of f and every partial derivative up to the order asked, evaluate each at (a,b), then substitute.

**Worked example:** expand eˣ sin y about (0,0) up to 3rd-degree terms.
- f = 0, f_x = 0, f_y = 1, f_xx = 0, f_xy = 1, f_yy = 0, f_xxx = 0, f_xxy = 1, f_xyy = 0, f_yyy = −1
- **eˣ sin y ≈ y + xy + (3x²y − y³)/6 = y + xy + x²y/2 − y³/6**

**Worked example:** expand x²y + 3y − 2 in powers of (x−1) and (y+2).
- At (1,−2): f = −10, f_x = 2xy = −4, f_y = x² + 3 = 4, f_xx = 2y = −4, f_xy = 2x = 2, f_yy = 0, f_xxy = 2
- **f = −10 − 4(x−1) + 4(y+2) − 2(x−1)² + 2(x−1)(y+2) + (x−1)²(y+2)**

> PYQ pattern: "Expand eˣ log(1+y)", "Expand eˣ cos y about (0, π/2)", or "Expand tan⁻¹(y/x) about (1,1)", all up to 2nd or 3rd degree.

---

## 3. Maxima and Minima (two variables)

**Steps:**
1. Solve f_x = 0 and f_y = 0 to get the stationary points.
2. Compute r = f_xx, s = f_xy, t = f_yy at each point.
3. Classify:

| rt − s² | r | Result |
|---|---|---|
| > 0 | < 0 | **Maximum** |
| > 0 | > 0 | **Minimum** |
| < 0 | – | **Saddle point** |
| = 0 | – | Test fails, investigate further |

**Worked example:** f = x³ + y³ − 3axy (a > 0).
- f_x = 3x² − 3ay = 0 and f_y = 3y² − 3ax = 0 give the points (0,0) and (a,a).
- r = 6x, s = −3a, t = 6y
- (0,0): rt − s² = −9a² < 0, so **saddle**
- (a,a): rt − s² = 27a² > 0 and r = 6a > 0, so **minimum, f_min = −a³**

**Worked example:** f = x⁴ + y⁴ − 2x² + 4xy − 2y².
- Stationary points: (0,0), (√2, −√2), (−√2, √2)
- At (±√2, ∓√2): r = 20, s = 4, t = 20, so rt − s² = 384 > 0 and r > 0. **Minimum, value −8**
- At (0,0): rt − s² = 0, so the test fails. Investigation shows it is neither a max nor a min.

---

## 4. Lagrange Multiplier Method

To find the extremum of f(x,y,z) subject to g(x,y,z) = 0:

1. Form F = f + λg.
2. Set F_x = 0, F_y = 0, F_z = 0, and g = 0.
3. Eliminate λ. The usual trick is to write each equation as λ = …, set them equal, or exploit symmetry.

**Worked example:** maximise xyz subject to x + y + z = a.
- yz + λ = 0, xz + λ = 0, xy + λ = 0, so yz = xz = xy, which gives x = y = z = a/3.
- **Max = a³/27**

**Worked example:** an open-top rectangular box has volume 32 cc. Find the dimensions for least surface area.
- f = xy + 2xz + 2yz, g = xyz − 32
- By symmetry x = y. Then S = x² + 128/x, and dS/dx = 0 gives x³ = 64.
- **x = y = 4, z = 2, S_min = 48**

**Worked example:** find the point on the plane x + 2y + 3z = 14 nearest to the origin.
- Minimise x² + y² + z². This gives 2x = λ, 2y = 2λ, 2z = 3λ, so (x,y,z) ∝ (1,2,3).
- **Point (1,2,3), distance √14**

> PYQ pattern: "Find the max/min distance from the origin to the curve/surface …", "Divide 24 into three parts such that …", "Temperature T = 400xyz² on the sphere x²+y²+z² = 1".

---

# MODULE II: Multiple Integrals

## 1. Change of Order of Integration

**Steps (always draw the region):**
1. From the given limits, write down the boundary curves.
2. Sketch the region and mark the intersection points.
3. Swap from vertical strips to horizontal strips (or the other way). If a strip's boundary changes partway, **split the region**.

**Worked example:** ∫₀^∞ ∫ₓ^∞ (e^(−y)/y) dy dx
- Region: 0 ≤ x ≤ y < ∞. After the swap: ∫₀^∞ ∫₀^y (e^(−y)/y) dx dy = ∫₀^∞ e^(−y) dy = **1**

**Worked example:** ∫₀¹ ∫_{x²}^{2−x} xy dy dx
- Region between the parabola y = x² and the line y = 2 − x, for 0 ≤ x ≤ 1.
- After the swap, split at y = 1:
  - 0 ≤ y ≤ 1: x goes from 0 to √y
  - 1 ≤ y ≤ 2: x goes from 0 to 2 − y
- = ∫₀¹ y²/2 dy + ∫₁² y(2−y)²/2 dy = 1/6 + 5/24 = **3/8**

**Worked example:** ∫₀^a ∫_{x/a}^{√(x/a)} (x² + y²) dy dx
- Region: y = x/a (line) and y² = x/a (parabola), meeting at (0,0) and (a,1).
- After the swap: ∫₀¹ ∫_{ay²}^{ay} (x² + y²) dx dy

---

## 2. Double Integrals in Polar Coordinates

Substitute **x = r cosθ, y = r sinθ, dx dy = r dr dθ**, and x² + y² = r².

**Worked example:** ∫₀^a ∫₀^{√(a²−x²)} (x² + y²) dy dx
- The region is a quarter circle. = ∫₀^{π/2} ∫₀^a r³ dr dθ = **πa⁴/8**

**Worked example:** ∫₀^∞ ∫₀^∞ e^(−(x²+y²)) dx dy
- = ∫₀^{π/2} ∫₀^∞ e^(−r²) r dr dθ = **π/4**. From this, ∫₀^∞ e^(−x²) dx = **√π/2** (often asked as a follow-up).

**Worked example:** area of the cardioid r = a(1 + cosθ)
- A = ∫₀^{2π} ∫₀^{a(1+cosθ)} r dr dθ = **3πa²/2**

**Useful values:** ∫₀^{π/2} sinⁿθ dθ = ∫₀^{π/2} cosⁿθ dθ is given by Wallis' formula.
- n even: [(n−1)(n−3)…1 / n(n−2)…2] · π/2
- n odd: (n−1)(n−3)…2 / n(n−2)…3

---

## 3. Triple Integrals: Cylindrical and Spherical

| System | Substitution | dV |
|---|---|---|
| Cylindrical | x = r cosθ, y = r sinθ, z = z | **r dr dθ dz** |
| Spherical | x = r sinθ cosφ, y = r sinθ sinφ, z = r cosθ | **r² sinθ dr dθ dφ** |

Use cylindrical when you see x² + y² (cylinders, paraboloids, cones). Use spherical when you see x² + y² + z² (spheres).
Spherical ranges: θ from 0 to π (measured from the z-axis) and φ from 0 to 2π. For the first octant only, both run from 0 to π/2.

**Worked example (spherical):** ∫₀¹ ∫₀^{√(1−x²)} ∫₀^{√(1−x²−y²)} dz dy dx / √(1 − x² − y² − z²)
- The region is the first octant of the unit sphere.
- = ∫₀^{π/2} dφ ∫₀^{π/2} sinθ dθ ∫₀¹ r²/√(1−r²) dr = (π/2)(1)(π/4) = **π²/8**

**Worked example (spherical):** ∭ (x² + y² + z²) dV over the unit sphere
- = ∫₀^{2π} ∫₀^π ∫₀¹ r⁴ sinθ dr dθ dφ = **4π/5**

**Worked example (cylindrical):** ∭ z dV over the cylinder x² + y² ≤ a², 0 ≤ z ≤ h
- = ∫₀^{2π} ∫₀^a ∫₀^h z r dz dr dθ = **πa²h²/2**

**Worked example (cylindrical):** volume bounded by the paraboloid z = x² + y² and the plane z = 4
- = ∫₀^{2π} ∫₀² (4 − r²) r dr dθ = **8π**

---

# MODULE III: Vector Calculus

## 1. Gradient, Divergence, Curl

With ∇ = i ∂/∂x + j ∂/∂y + k ∂/∂z and F = F₁i + F₂j + F₃k:
- **grad φ = ∇φ** gives the normal to the surface φ = c. Directional derivative = ∇φ · â
- **div F = ∇·F = ∂F₁/∂x + ∂F₂/∂y + ∂F₃/∂z**
- **curl F = ∇×F** =
```
| i      j      k    |
| ∂/∂x   ∂/∂y   ∂/∂z |
| F₁     F₂     F₃   |
```
- **Solenoidal** means div F = 0. **Irrotational** means curl F = 0.
- Identities: curl(grad φ) = 0, div(curl F) = 0, ∇·(r) = 3, ∇×(r) = 0, ∇rⁿ = n rⁿ⁻² r, ∇²(rⁿ) = n(n+1)rⁿ⁻²

**Worked example:** find a so that F = (x + 3y)i + (y − 2z)j + (x + az)k is solenoidal.
- div F = 1 + 1 + a = 0, so **a = −2**

## 2. Scalar Potential Functions

If curl F = 0, then F = ∇φ for some scalar φ (the scalar potential).

**Method:** integrate F₁ with respect to x, F₂ with respect to y, and F₃ with respect to z. Combine them, writing each distinct term only once.

**Worked example:** find a, b, c so that F = (x + 2y + az)i + (bx − 3y − z)j + (4x + cy + 2z)k is irrotational, then find φ.
- curl F = (c + 1)i + (a − 4)j + (b − 2)k = 0, so **a = 4, b = 2, c = −1**
- **φ = x²/2 − 3y²/2 + z² + 2xy + 4xz − yz + C**
- Check: φ_x = x + 2y + 4z ✓, φ_y = 2x − 3y − z ✓, φ_z = 4x − y + 2z ✓

**Work done:** if F = ∇φ, then ∫_A^B F·dr = φ(B) − φ(A), independent of the path.

## 3. Integral Theorems

| Theorem | Statement |
|---|---|
| **Green's** (plane) | ∮_C (M dx + N dy) = ∬_R (∂N/∂x − ∂M/∂y) dx dy |
| **Stokes'** | ∮_C F·dr = ∬_S (∇×F)·n̂ dS |
| **Gauss divergence** | ∯_S F·n̂ dS = ∭_V (∇·F) dV |

**Worked example (Green's):** verify the theorem for ∮ (xy + y²) dx + x² dy, where C bounds y = x and y = x².
- Double-integral side: ∬ (2x − x − 2y) dA = ∫₀¹ ∫_{x²}^x (x − 2y) dy dx = ∫₀¹ (x⁴ − x³) dx = **−1/20**
- Line-integral side:
  - Along y = x² (dy = 2x dx), from 0 to 1: ∫₀¹ (x³ + x⁴ + 2x³) dx = ∫₀¹ (3x³ + x⁴) dx = 3/4 + 1/5 = 19/20
  - Along y = x (dy = dx), from 1 to 0: ∫₁⁰ 3x² dx = −1
  - Total = **−1/20** ✓

**Worked example (Gauss):** F = 4xz i − y² j + yz k over the unit cube 0 ≤ x, y, z ≤ 1.
- div F = 4z − 2y + y = 4z − y
- ∭ (4z − y) dV = 2 − 1/2 = **3/2**
- (If "verify" is asked, also compute the flux through all 6 faces: they sum to 3/2.)

**Worked example (Gauss):** F = xi + yj + zk over the sphere of radius a.
- div F = 3, so the flux = 3 · (4/3)πa³ = **4πa³**

**Worked example (Stokes):** F = (x² + y²)i − 2xy j, around the rectangle x = ±a, y = 0, y = b.
- curl F = (−2y − 2y)k = −4y k, with n̂ = k
- ∬ −4y dx dy = −4(2a)(b²/2) = **−4ab²**

> PYQ pattern: "Verify Green's theorem for … in the region bounded by …" (10 marks), "Using Gauss divergence theorem evaluate … over the cylinder x²+y² = 4, 0 ≤ z ≤ 3", "Verify Stokes' theorem for F = … over the hemisphere/square".

---

# MODULE IV: Second-Order ODEs

General solution: **y = CF + PI**. The CF comes from the auxiliary equation:

| Roots of the auxiliary equation | CF |
|---|---|
| Real and distinct m₁, m₂ | c₁e^(m₁x) + c₂e^(m₂x) |
| Repeated m | (c₁ + c₂x)e^(mx) |
| Complex α ± iβ | e^(αx)(c₁ cos βx + c₂ sin βx) |

## 1. Method of Undetermined Coefficients

Guess the form of y_p from R(x), substitute, and compare coefficients.

| R(x) | Trial y_p |
|---|---|
| e^(ax) | A e^(ax) |
| polynomial of degree n | A₀ + A₁x + … + Aₙxⁿ |
| sin bx or cos bx | A cos bx + B sin bx |
| e^(ax) sin bx | e^(ax)(A cos bx + B sin bx) |

**Modification rule:** if any term of the trial y_p already appears in the CF, multiply the trial by x (by x² if the root is repeated).

**Worked examples:**
- y″ − 3y′ + 2y = e^(3x): CF = c₁eˣ + c₂e^(2x), y_p = Ae^(3x), which gives 2A = 1. **y_p = e^(3x)/2**
- y″ − 3y′ + 2y = eˣ: eˣ is in the CF, so try Axeˣ. Substituting gives −A = 1. **y_p = −xeˣ**
- y″ + y = x²: try Ax² + Bx + C. **y_p = x² − 2**
- y″ + 4y = sin 2x (resonance): try x(A cos 2x + B sin 2x). **y_p = −(x cos 2x)/4**

## 2. Method of Variation of Parameters

For y″ + p y′ + q y = R(x), with CF = c₁y₁ + c₂y₂:

```
W = y₁y₂′ − y₂y₁′
y_p = −y₁ ∫ (y₂ R / W) dx + y₂ ∫ (y₁ R / W) dx
```
(The equation must be in standard form, with the coefficient of y″ equal to 1.)

**Worked example:** y″ + y = sec x
- y₁ = cos x, y₂ = sin x, W = 1
- y_p = −cos x ∫ tan x dx + sin x ∫ 1 dx = **cos x · ln|cos x| + x sin x**

**Worked example:** y″ − 2y′ + y = eˣ/x
- y₁ = eˣ, y₂ = xeˣ, W = e^(2x)
- y_p = −eˣ ∫ 1 dx + xeˣ ∫ (1/x) dx = −xeˣ + xeˣ ln x. The −xeˣ is absorbed into the CF, so **y_p = xeˣ ln x**

**Common questions:** y″ + a²y = tan ax, sec ax, or cosec ax; y″ + 4y = tan 2x.

## 3. Variable-Coefficient Equations (Cauchy–Euler and Legendre)

**Cauchy–Euler:** x²y″ + a x y′ + b y = R(x)
- Put x = e^z (z = ln x), with θ = d/dz: **xD = θ, x²D² = θ(θ − 1), x³D³ = θ(θ−1)(θ−2)**
- This gives a constant-coefficient equation in z. Solve it, then replace z by ln x.

**Legendre:** (ax + b)²y″ + … : put ax + b = e^z. Then (ax+b)D = aθ and (ax+b)²D² = a²θ(θ − 1).

**Worked example:** x²y″ − xy′ + y = ln x
- θ(θ−1) − θ + 1 = (θ − 1)², and the right side becomes z.
- CF = (c₁ + c₂z)e^z
- PI = (1/(1−θ)²) z = (1 + 2θ + …) z = z + 2
- **y = x(c₁ + c₂ ln x) + ln x + 2**

**Worked example:** x²y″ + xy′ + y = 0
- θ² + 1 = 0, so **y = c₁ cos(ln x) + c₂ sin(ln x)**

> These can also be combined: convert to constant coefficients first, then use undetermined coefficients or variation of parameters on the result. VIT papers sometimes say "solve by variation of parameters: x²y″ + xy′ − y = x² eˣ".

---

# MODULE V: First-Order Partial Differential Equations

Notation: **p = ∂z/∂x, q = ∂z/∂y**

## 1. Lagrange's Linear Equation: Pp + Qq = R

**Auxiliary equations:** dx/P = dy/Q = dz/R. Find two independent solutions u = c₁ and v = c₂. The general solution is **φ(u, v) = 0**.

**Tricks for finding u and v:**
- **Grouping:** pick two fractions in which only two variables appear.
- **Multipliers (l, m, n):** choose them so that lP + mQ + nR = 0. Then l dx + m dy + n dz = 0, which integrates to a solution. Common choices are (1,1,1), (x,y,z), and (1/x, 1/y, 1/z).

**Worked examples:**
- xp + yq = z: dx/x = dy/y = dz/z, so **φ(y/x, z/x) = 0**
- x(y − z)p + y(z − x)q = z(x − y):
  - Multipliers (1,1,1) give x + y + z = c₁.
  - Multipliers (1/x, 1/y, 1/z) give xyz = c₂.
  - **φ(x + y + z, xyz) = 0**
- (y²z/x)p + xzq = y²:
  - The first two fractions give x²dx = y²dy, so x³ − y³ = c₁.
  - The first and third give x dx = z dz, so x² − z² = c₂.
  - **φ(x³ − y³, x² − z²) = 0**
- (x² − yz)p + (y² − zx)q = z² − xy: use dx−dy over (P−Q), and so on. The result is **φ((x−y)/(y−z), xy+yz+zx) = 0**

## 2. The Four Standard Types (non-linear, first order)

| Type | Form | Method | Complete integral |
|---|---|---|---|
| **I** | f(p, q) = 0 | Put p = a, q = b with f(a,b) = 0 | z = ax + b(a)y + c |
| **II** | f(z, p, q) = 0 | Put u = x + ay, p = dz/du, q = a dz/du, then solve the ODE | from the ODE |
| **III** | f(x, p) = g(y, q) | Set both sides equal to k; then dz = p dx + q dy | z = ∫p dx + ∫q dy + c |
| **IV** | z = px + qy + f(p, q) (**Clairaut**) | Replace p by a, q by b | z = ax + by + f(a,b) |

**Type I examples:**
- p² + q² = 1: **z = ax + √(1 − a²) y + c**
- √p + √q = 1: **z = ax + (1 − √a)² y + c**
- pq = 1: z = ax + y/a + c

**Type II examples:**
- z = p² + q²: z = (1 + a²)(dz/du)², which integrates to **4(1 + a²)z = (x + ay + c)²**
- p(1 + q) = qz: z′(1 + az′) = azz′, so az′ = az − 1, giving **ln(az − 1) = x + ay + c**

**Type III examples:**
- p² + q² = x + y: p² − x = y − q² = k, so **z = (2/3)(x+k)^(3/2) + (2/3)(y−k)^(3/2) + c**
- p − x² = q + y²: p = x² + k, q = k − y², so **z = x³/3 + kx + ky − y³/3 + c**

**Singular integral:** differentiate the complete integral with respect to a and b, set ∂z/∂a = 0 and ∂z/∂b = 0, and eliminate a and b.

## 3. Clairaut's Form (Type IV)

**Worked example:** z = px + qy + pq
- Complete integral: **z = ax + by + ab**
- Singular integral: x + b = 0 and y + a = 0, so a = −y, b = −x. **z = −xy**

**Worked example:** z = px + qy + √(1 + p² + q²)
- Complete integral: z = ax + by + √(1 + a² + b²)
- Singular integral: **x² + y² + z² = 1**

**Worked example:** z = px + qy + p² + q²
- Complete integral: z = ax + by + a² + b². Singular integral: **4z = −(x² + y²)**

> Some VIT papers hide Clairaut's form. For example, (px + qy − z)² = 1 + p² + q² rearranges to z = px + qy ± √(1+p²+q²). Others need a substitution first (X = x², etc.).

## 4. Method of Separation of Variables

**Steps:**
1. Assume u(x, t) = X(x)T(t).
2. Substitute and divide by XT.
3. Put each side equal to a constant k, which gives two ODEs.
4. Solve both and multiply. Use the initial or boundary condition to find the constants.

**Worked example:** u_x = 2u_t + u, u(x, 0) = 6e^(−3x)
- X′T = 2XT′ + XT, so X′/X − 1 = 2T′/T = k
- X = c e^((1+k)x), T = e^(kt/2)
- u(x,0) = c e^((1+k)x) = 6e^(−3x), so c = 6, k = −4
- **u = 6e^(−3x − 2t)**

**Worked example:** 3u_x + 2u_y = 0, u(x, 0) = 4e^(−x)
- 3X′/X = −2Y′/Y = k, so u = c e^(kx/3 − ky/2)
- Matching: c = 4, k = −3, so **u = 4e^(−x + 3y/2)**

**Worked example:** u_x = 4u_y, u(0, y) = 8e^(−3y)
- **u = 8e^(−12x − 3y)**

---

# 📝 ONE-PAGE FORMULA SHEET (read in the last 30 minutes)

**Module I**
- J(polar) = r, J(cylindrical) = r, J(spherical) = r² sinθ. JJ′ = 1. J = 0 ⇔ functionally dependent
- Taylor: f + (hf_x + kf_y) + (1/2!)(h²f_xx + 2hkf_xy + k²f_yy) + …
- rt − s² > 0 with r < 0: max. With r > 0: min. rt − s² < 0: saddle. = 0: doubtful
- Lagrange: F = f + λg, set all partials to 0, use g = 0

**Module II**
- Change of order: draw the region, swap strips, split if needed
- dx dy = r dr dθ. dV = r dr dθ dz (cylindrical) = r² sinθ dr dθ dφ (spherical)
- ∫₀^∞ e^(−x²) dx = √π/2

**Module III**
- div = ∇·F, curl = ∇×F. Solenoidal: div = 0. Irrotational: curl = 0, so F = ∇φ
- Green: ∮M dx + N dy = ∬(N_x − M_y) dA
- Stokes: ∮F·dr = ∬(∇×F)·n̂ dS
- Gauss: ∯F·n̂ dS = ∭∇·F dV

**Module IV**
- Undetermined coefficients: guess the form; multiply by x if the guess overlaps the CF
- Variation of parameters: W = y₁y₂′ − y₂y₁′, y_p = −y₁∫y₂R/W + y₂∫y₁R/W
- Cauchy–Euler: x = e^z, xD = θ, x²D² = θ(θ−1)
- Legendre: ax + b = e^z, (ax+b)D = aθ

**Module V**
- Lagrange: dx/P = dy/Q = dz/R, giving φ(u,v) = 0. Multipliers satisfy lP + mQ + nR = 0
- Type I f(p,q): z = ax + by + c
- Type II f(z,p,q): u = x + ay
- Type III f(x,p) = g(y,q) = k
- Type IV Clairaut: z = ax + by + f(a,b); singular from ∂/∂a = ∂/∂b = 0
- Separation of variables: u = XT, each side = k

---

### Exam-day tips
1. **Draw the region** in every Module II question, even if it isn't asked for. Sketches earn step marks.
2. For "verify" theorem questions, compute **both sides** and state "Hence verified."
3. In Module IV, always write CF, PI, and the general solution as separate labelled lines.
4. In Module V, name the type first ("This is Type II, f(z,p,q) = 0"). Examiners give marks for identifying it.
5. Do Lagrange multipliers, maxima/minima, and Clairaut questions first. They are short and reliable.

Good luck! 🍀
