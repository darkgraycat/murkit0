import { EntityManager, Component, System } from "./simple.ecs";

describe("ecs/simple.ecs", () => {
  describe("Component + System", () => {
    const cAccumulator = new Component({ energy: 0, history: [] });
    const cTranstitter = new Component({ label: "", signal: 0 });
    const sSignalSharing = new System(
      { acc: cAccumulator, tr: cTranstitter },
      (dt, { acc, tr }, transmitters, recievers) => {
        const { label, signal } = tr.storage;
        const { history, energy } = acc.storage;
        for (const t of transmitters) {
          if (energy[t] <= 0) continue; // empty transmitters cannot share
          for (const r of recievers) {
            if (t == r) continue; // do not share to self
            const amount = signal[t] * dt;
            energy[r] += amount;
            energy[t] -= amount;
            history[r].push(`${label[t]}+${amount}`);
            history[t].push(`${label[r]}-${amount}`);
          }
        }
      },
    );

    let idx: number;
    const createEntity = (
      label: string,
      signal: number,
      energy: number,
    ): number => {
      cTranstitter.set(idx, { label, signal });
      cAccumulator.set(idx, { energy, history: [] });
      return idx++;
    };

    const reset = () => {
      idx = 0;
      cAccumulator.reset();
      cTranstitter.reset();
    };

    beforeEach(reset);

    it("omega shares to alpha and beta", () => {
      const [a, b, o] = [
        createEntity("alpha", 2, 0),
        createEntity("beta", 3, 0),
        createEntity("omega", 5, 20),
      ];
      const omegaSharing = sSignalSharing.setup([o], [a, b]);
      const alphaBetaSharing = sSignalSharing.setup([a, b], [a, b]);

      const { energy, history } = cAccumulator.storage;

      expect(energy).toEqual([0, 0, 20]);
      alphaBetaSharing(1); // nothing to share
      expect(energy).toEqual([0, 0, 20]);
      omegaSharing(1);
      expect(energy).toEqual([5, 5, 10]);
      expect(history).toEqual([
        ["omega+5"],
        ["omega+5"],
        ["alpha-5", "beta-5"],
      ]);
      alphaBetaSharing(1); // share energy recieved from omega
      expect(energy).toEqual([6, 4, 10]);
      expect(history).toEqual([
        ["omega+5", "beta-2", "beta+3"],
        ["omega+5", "alpha+2", "alpha-3"],
        ["alpha-5", "beta-5"],
      ]);
    });
  });

  describe("EntityManager + Component", () => {
    const cShape = new Component({ w: 0, h: 0 });
    const cState = new Component({ active: false });
    const cMeta = new Component({ name: "", stats: [] });
    beforeEach(() => {
      cShape.reset();
      cState.reset();
      cMeta.reset();
    });
    it("EntityManager with one Component", () => {
      const em = new EntityManager({ cMeta });
      const a = em.add({ cMeta: { name: "A", stats: [1] } });
      const b = em.add({ cMeta: { name: "B", stats: [2] } });
      expect(em.get(a)).toEqual({ cMeta: { name: "A", stats: [1] } });
      expect(em.get(b)).toEqual({ cMeta: { name: "B", stats: [2] } });
      em.set(b, { cMeta: { name: "B", stats: [2, 2] } });
      const c = em.add({ cMeta: { name: "C", stats: [3, 3, 3] } });
      expect([a, b, c]).toEqual([0, 1, 2]);
      expect(em.get(a)).toEqual({ cMeta: { name: "A", stats: [1] } });
      expect(em.get(b)).toEqual({ cMeta: { name: "B", stats: [2, 2] } });
      expect(em.get(c)).toEqual({ cMeta: { name: "C", stats: [3, 3, 3] } });
    });
    it("EntityManager with two Components", () => {
      const em = new EntityManager({ cShape, cState });
      const a = em.add({ cShape: { w: 10, h: 20 }, cState: { active: true } });
      const b = em.add({ cShape: { w: 30, h: 40 } });
      expect(em.get(a)).toEqual({
        cShape: { w: 10, h: 20 },
        cState: { active: true },
      });
      expect(em.get(b)).toEqual({ cShape: { w: 30, h: 40 }, cState: {} });
      em.set(b, null);
      const c = em.add({ cState: { active: false } });
      expect([a, b, c]).toEqual([0, 1, 2]);
      expect(em.get(a)).toEqual({
        cShape: { w: 10, h: 20 },
        cState: { active: true },
      });
      expect(em.get(b)).toEqual({
        cShape: { w: 0, h: 0 },
        cState: { active: false },
      });
      expect(em.get(c)).toEqual({ cShape: {}, cState: { active: false } });
    });
    it("EntityManager and Component modifications", () => {
      const em = new EntityManager({ cState, cMeta });
      const a = em.add({ cState: { active: false } });
      expect(em.get(a)).toEqual({ cMeta: {}, cState: { active: false } });
      const { active } = cState.storage;
      const { name, stats } = cMeta.storage;
      expect(active).toEqual([false]);
      expect(name).toEqual([undefined]);
      expect(stats).toEqual([undefined]);
      em.set(a, { cState: { active: true }, cMeta: { name: "A", stats: [1] } });
      expect(active).toEqual([true]);
      expect(name).toEqual(["A"]);
      expect(stats).toEqual([[1]]);
    });
  });

  describe("EntityManager + Component + System", () => {
    const cPos = new Component({ pos: 0, vel: 0 });
    const cStat = new Component({ name: "", hp: 0, dmg: 0 });
    const em = new EntityManager({ cPos, cStat });
    const sMovement = new System({ cPos }, (dt, comps, entities) => {
      const { pos, vel } = comps.cPos.storage;
      for (const e of entities) {
        if (vel[e] == 0) continue;
        const calcPos = pos[e] + vel[e] * dt;
        pos[e] = calcPos > 100 ? 100 : calcPos < 0 ? 0 : calcPos;
        if (calcPos > 100 || calcPos < 0) {
          vel[e] *= -1;
          pos[e] = calcPos > 100 ? 100 : 0;
        } else {
          pos[e] = calcPos;
        }
      }
    });
    const sBattle = new System(
      { cPos, cStat },
      (dt, comps, attackers, defenders) => {
        const { pos } = comps.cPos.storage;
        const { hp, dmg } = comps.cStat.storage;
        for (const a of attackers) {
          if (hp[a] <= 0) continue;
          for (const d of defenders) {
            if (hp[d] <= 0) continue;
            if (pos[a] != pos[d]) continue;
            logBattle(a, d);
            hp[d] -= dmg[a] * dt;
          }
        }
      },
    );

    const logBattle = (attacker: number, defender: number) => {
      const { name, hp, dmg } = cStat.storage;
      console.log(
        name[attacker] +
        `(${hp[attacker]}) attacks ` +
        name[defender] +
        `(${hp[defender]}) dealing ` +
        dmg[attacker] +
        " damage",
      );
    };

    const getStats = (entity: number) => {
      const { cPos, cStat } = em.get(entity);
      return [cPos.pos, cStat.hp];
    };

    beforeEach(() => {
      em.reset();
    });

    it("battle 1 vs 1", () => {
      const player = em.add({
        cPos: { pos: 0, vel: 2 },
        cStat: { name: "Warrior", hp: 100, dmg: 4 },
      });
      const enemy0 = em.add({
        cPos: { pos: 100, vel: -2 },
        cStat: { name: "Orc", hp: 80, dmg: 3 },
      });
      const move = sMovement.setup([player, enemy0]);
      const playerAtk = sBattle.setup([player], [enemy0]);
      const enemiesAtk = sBattle.setup([enemy0], [player]);

      const tick = (dt: number) => {
        move(dt);
        playerAtk(dt);
        enemiesAtk(dt);
      };
      const { vel } = cPos.storage;

      expect(getStats(player)).toEqual([0, 100]);
      expect(getStats(enemy0)).toEqual([100, 80]);
      tick(20);
      expect(getStats(player)).toEqual([40, 100]);
      expect(getStats(enemy0)).toEqual([60, 80]);
      tick(5);
      expect(getStats(player)).toEqual([50, 85]);
      expect(getStats(enemy0)).toEqual([50, 60]);
      vel[player] = 0;
      vel[enemy0] = 0;
      tick(20);
      expect(getStats(player)).toEqual([50, 85]);
      expect(getStats(enemy0)).toEqual([50, -20]);
    });
  });

  describe("ECS experimental features", () => {
    it("System and dynamic entity groups", () => {
      const cPos = new Component({ health: 0, dmg: 10 });
      cPos.set(0, { health: 100, dmg: 10 });
      cPos.set(1, { health: 100, dmg: 20 });
      cPos.set(2, { health: 100, dmg: 30 });
      cPos.set(3, { health: 100, dmg: 40 });
      cPos.set(4, { health: 100, dmg: 50 });
      const groupA = [0, 1, 2];
      const groupB = [3, 4];
      const logs: string[] = [];
      const sExec = new System(
        { cPos },
        (dt, comps, ents1, ents2) => {
          const { health, dmg } = comps.cPos.storage;
          for (const e1 of ents1) {
            for (const e2 of ents2) {
              logs.push(`${e1} damages ${e2} at ${dt}`);
              health[e2] -= dmg[e1]
            }
          }
        }
      )
      const exec = sExec.setup(groupA, groupB);
      const { storage: { health } } = cPos;
      expect(health).toEqual([100, 100, 100, 100, 100]);
      exec(1);
      expect(health).toEqual([100, 100, 100, 40, 40]);
      groupB.pop();
      exec(2);
      expect(health).toEqual([100, 100, 100, -20, 40]);
      groupB.push(groupA.pop());
      exec(3);
      expect(health).toEqual([100, 100, 70, -50, 40]);
      // console.log(logs)
    });
    it("Component with optional properties", () => {
      const cComp = new Component<{ label: string, a?: number, desc?: string }>({ label: "", a: 10, desc: "no desc" });
      cComp.set(0, { label: "First", a: 17, desc: "First comp" });
      cComp.set(1, { label: "Second", a: 12 });
      cComp.set(2, { label: "Third" });
      const { storage } = cComp;
      expect(storage.label).toEqual([ "First", "Second", "Third" ]);
      expect(storage.a).toEqual([ 17, 12, 10 ]);
      expect(storage.desc).toEqual([ "First comp", "no desc", "no desc" ]);
    })
    it("Compoment with method", () => {
      type cCompMethod = () => Partial<cCompProps>;
      type cCompProps = { a: number, b: number, op: cCompMethod };
      const op: cCompMethod = () => ({ a: 10, b: 20 });
      const cComp = new Component<cCompProps>({ a: 0, b: 0, op });
      const [a, b]  = [
        cComp.set(0, { a: 2, b: 3, op }),
        cComp.set(1, { a: 5, b: 7, op }),
      ];
      const sSystem = new System(
        { cComp },
        (_, comps, ents) => {
          const { op } = cComp.storage;
          for (const e of ents) {
            op[e]();
          }
        }
      );
    });
    it("System controls System", () => {
      const cComp = new Component({ val: 0, acc: 0 });
      const entities = [0, 1, 2, 3].map(id => cComp.set(id, { val: 0, acc: id + 2 }));
      const sAddVal = new System(
        { cComp },
        (_, { cComp }, entities) => {
          const { val, acc } = cComp.storage;
          for (const e of entities) val[e] += acc[e];
        }
      );
      let ents = entities;
      let cb = sAddVal.setup(ents);
      const sFilterBy10 = new System(
        { cComp },
        (_, { cComp }, entities) => {
          const { val } = cComp.storage;
          for (const e of entities) {
            if (val[e] < 10) continue;
            ents.splice(e, 1); // dont care that its inefective
            cb = sAddVal.setup(ents);
          }
          cb();
        }
      );
      const tick = sFilterBy10.setup(ents);
      const { storage } = cComp;
      expect(storage.val).toEqual([0, 0, 0, 0]);
      tick(); expect(storage.val).toEqual([2, 3, 4, 5]);
      tick(); expect(storage.val).toEqual([4, 6, 8, 10]);
      tick(); expect(storage.val).toEqual([6, 9, 12, 10]);
      tick(); expect(storage.val).toEqual([8, 12, 12, 10]);
      tick(); expect(storage.val).toEqual([10, 12, 12, 10]);
    });
    it("Multiple Entity Managers with Intersections", () => {
      // NOTE: intersections doesnt works, because components has own storage
      const cData = new Component<{ name: string, value?: number}>({ value: 0, name: "" });
      const cAlpha = new Component<{ a?: number }>({ a: 2 });
      const cBeta = new Component<{ a?: number }>({ a: 3 });
      const sShareA = new System(
        { cData, cAlpha },
        (_, c, es) => {
          const { a } = c.cAlpha.storage;
          const { name, value } = c.cData.storage;
          for (const e of es) {
            value[e] += a[e];
            if (value[e] > 10) {
              console.log(`Alpha Overflow ${name[e]}: ${value[e]}`);
              value[e] = -a[e];
            }
          }
        }
      );
      const sShareB = new System(
        { cData, cBeta },
        (_, c, es) => {
          const { a } = c.cBeta.storage;
          const { name, value } = c.cData.storage;
          for (const e of es) {
            value[e] += a[e];
            if (value[e] > 10) {
              console.log(`Beta Overflow ${name[e]}: ${value[e]}`);
              value[e] = -a[e];
            }
          }
        }
      );
      const alphaEm = new EntityManager({ cData, cAlpha });
      const betaEm = new EntityManager({ cData, cBeta });
      
      console.log({ cData: cData.storage, cAlpha: cAlpha.storage, cBeta: cBeta.storage });
      expect(cData.storage).toEqual({
        name: [],
        value: [],
      });

      let idx = 0;
      const cra = (name: string, value: number, mod: number) => alphaEm.set(idx++, { cData: { name, value }, cAlpha: { a: mod } });
      const crb = (name: string, value: number, mod: number) => betaEm.set(idx++, { cData: { name, value }, cBeta: { a: mod } });
      const [a0, b0, a1, b1] = [
        cra("AL_0", 0, 2),
        crb("BT_0", 0, 3),
        cra("AL_1", 5, 2),
        crb("BT_1", 5, 3),
      ]
      const shareA = sShareA.setup([a0, a1]);
      const shareB = sShareB.setup([b0, b1]);
      shareA(0); shareB(0);
      shareA(0); shareB(0);
      shareA(0); shareB(0);
      console.log({ cData: cData.storage, cAlpha: cAlpha.storage, cBeta: cBeta.storage });
    });
  });
});
