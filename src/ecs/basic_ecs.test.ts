import { Component, System } from './basic_ecs';
import { ContinualList } from '../utils';

describe('basic_ecs', () => {
  describe('Component', () => {
    it('test types', () => {
      const testComponent = new Component({ num: 0, bool: false, str: '' });
      const { storage } = testComponent;
      const [a, b, c, d] = [
        testComponent.add({ num: 100, bool: true, str: 'A' }),
        testComponent.add({ num: -20, bool: false, str: 'BB' }),
        testComponent.add({ num: 3.14, bool: true, str: 'CCC' }),
        3,
      ];
      storage.num[d] = 777;     // adding this way
      storage.bool[d] = false;  // will cause bug
      storage.str[d] = 'DDDD';  // nextIndex is not incremented
      expect(storage.num).toEqual([100, -20, 3.14, 777]);
      expect(storage.bool).toEqual([true, false, true, false]);
      expect(storage.str).toEqual(['A', 'BB', 'CCC', 'DDDD']);
      testComponent.delete(c);
      testComponent.delete(d);  // and 'e' will takes 'd' index
      const e = testComponent.add({ num: 42, bool: true, str: 'EEEEE' });
      expect(e).toBe(d);

      testComponent.set(a, { num: 1000, bool: false, str: 'aAa' });
      expect(storage.num).toEqual([1000, -20, undefined, 42]);
      expect(storage.bool).toEqual([false, false, undefined, true]);
      expect(storage.str).toEqual(['aAa', 'BB', undefined, 'EEEEE']);

      const aData = testComponent.get(a);
      expect(aData).toEqual({ num: 1000, bool: false, str: 'aAa' });
    });
  });
  describe('System', () => {
    const BOUNDS = 10;
    const cLocation = new Component({ loc: 0 });
    const cVelocity = new Component({ vel: 0 });
    const cStats = new Component({ name: '', hp: 0, active: false, dmg: 0 });
    const cEffect = new Component({ time: 0, bonusHp: 0 });

    const createMob = (loc, vel, name, hp, dmg) => {
      const [e] = [
        cLocation.add({ loc }),
        cVelocity.add({ vel }),
        cStats.add({ name, hp, dmg, active: true }),
        cEffect.add({ time: -1, bonusHp: 0 })
      ];
      return e;
    };
    // TODO: need state container to move indexes in a parralel
    const createEffect = (loc, bonusHp, time) => {
      const [e] = [
        cLocation.add({ loc }),
        cVelocity.add({ vel: 0 }),
        cStats.add({ name: 'trap', hp: 0, active: false, dmg: 0 }),
        cEffect.add({ bonusHp, time }),
      ];
      return e;
    };

    const sMovement = new System({
      loc: cLocation,
      vel: cVelocity,
    }, (components, entities) => {
      const {
        loc: { storage: { loc } },
        vel: { storage: { vel } },
      } = components;
      for (const e of entities) {
        loc[e] += vel[e];
      }
    });

    const sCollide = new System({
      loc: cLocation,
      vel: cVelocity,
    }, (components, entities) => {
      const {
        loc: { storage: { loc } },
        vel: { storage: { vel } },
      } = components;
      for (const e of entities) {
        if (loc[e] < 0) vel[e] = Math.abs(vel[e]);
        if (loc[e] > BOUNDS) vel[e] = -Math.abs(vel[e]);
      }
    });

    const sDamage = new System({
      loc: cLocation,
      stat: cStats,
    }, (components, entities) => {
      const {
        loc: { storage: { loc } },
        stat: { storage: { hp, active, name, dmg } },
      } = components;
      for (const e of entities) {
        if (active[e] == false) continue;
        for (const ee of entities) {
          if (e == ee) continue;
          if (active[ee] == false) continue;
          if (name[e] == name[ee]) continue;
          if (loc[e] != loc[ee]) continue;
          console.log(`Battle "${name[e]}"${hp[e]} VS "${name[ee]}"${hp[ee]} at ${loc[e]}km causing ${dmg[e]} damage`);
          hp[ee] -= dmg[e];
          if (hp[ee] <= 0) {
            active[ee] = false;
            console.log(`...and "${name[ee]}" is dead by "${name[e]}"`);
          };
        }
      }
    });

    const sEnviroment = new System({
      loc: cLocation,
      stat: cStats,
      eff: cEffect,
    }, (components, entities) => {
      const {
        loc: { storage: { loc } },
        stat: { storage: { hp, active, name } },
        eff: { storage: { time, bonusHp } },
      } = components;
      for (const e of entities) {
        if (time[e] == undefined) continue;
        if (time[e] > 0) time[e]--;
        if (time[e] == 0) {
          for (const ee of entities) {
            if (active[ee] == false) continue;
            if (loc[e] != loc[ee]) continue;
            console.log(bonusHp[e] < 0
              ? `"${name[ee]}"${hp[ee]} steped on mine at ${loc[e]}km and got damage ${-bonusHp[e]}`
              : `"${name[ee]}"${hp[ee]} found healing herbs at ${loc[e]}km and heals ${bonusHp[e]}`
            );
            hp[ee] += bonusHp[e];
            if (hp[ee] <= 0) {
              active[ee] = false;
              console.log(`...and "${name[ee]}" is dead by "${name[e]}"`);
            }
            time[e] = 3;
            break;
          }
        }
      }
    });

    const step = () => {
      sMovement.exec();
      sCollide.exec();
      sDamage.exec();
      sEnviroment.exec();
    };

    const getEntityDetails = (e: number) => {
      return {
        loc: cLocation.storage.loc[e],
        vel: cVelocity.storage.vel[e],
        name: cStats.storage.name[e],
        hp: cStats.storage.hp[e],
        active: cStats.storage.active[e],
        time: cEffect.storage.time[e],
        bonusHp: cEffect.storage.bonusHp[e],
      };
    };

    beforeEach(() => {
      sMovement.set();
      sCollide.set();
      sDamage.set();
      sEnviroment.set();
    });

    it('should test movement and colliding systems', () => {
      const [player, orc] = [
        createMob(5, 3, 'hero', 10, 0),
        createMob(4, -2, 'orc', 5, 0),
      ];
      const { storage: { loc } } = cLocation;
      const { storage: { vel } } = cVelocity;
      sMovement.add(player, orc);
      sCollide.add(player, orc);
      step();
      expect([loc[player], vel[player]]).toEqual([8, 3]);
      expect([loc[orc], vel[orc]]).toEqual([2, -2]);
      step();
      expect([loc[player], vel[player]]).toEqual([11, -3]);
      expect([loc[orc], vel[orc]]).toEqual([0, -2]);
      step();
      expect([loc[player], vel[player]]).toEqual([8, -3]);
      expect([loc[orc], vel[orc]]).toEqual([-2, 2]);
      step();
      expect([loc[player], vel[player]]).toEqual([5, -3]);
      expect([loc[orc], vel[orc]]).toEqual([0, 2]);
      step();
      expect([loc[player], vel[player]]).toEqual([2, -3]);
      expect([loc[orc], vel[orc]]).toEqual([2, 2]);
      step();
      expect([loc[player], vel[player]]).toEqual([-1, 3]);
      expect([loc[orc], vel[orc]]).toEqual([4, 2]);
      step();
      expect([loc[player], vel[player]]).toEqual([2, 3]);
      expect([loc[orc], vel[orc]]).toEqual([6, 2]);
    });

    it('should test movement, damage and environment systems', () => {
      const [player, orc1, orc2] = [
        createMob(0, 1, 'hero', 10, 3),
        createMob(9, -2, 'orc', 5, 2),
        createMob(10, -1, 'orc', 5, 2),
      ];
      const [mine, heal] = [
        createEffect(5, -3, 2),
        createEffect(4, +5, 1),
      ];
      const { storage: { loc } } = cLocation;
      const { storage: { hp, active } } = cStats;
      const { storage: { time } } = cEffect;
      sMovement.add(player, orc1, orc2);
      sDamage.add(orc1, player, orc2);  // give orc1 opportunity to attack first
      sEnviroment.add(player, orc1, orc2, mine, heal);

      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([1, 7, 9]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([10, 5, 5]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, true, true]);
      expect([time[mine], time[heal]]).toEqual([1, 0]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([2, 5, 8]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([10, 2, 5]);
      expect([time[mine], time[heal]]).toEqual([3, 0]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([3, 3, 7]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([8, -1, 5]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, false, true]);
      expect([time[mine], time[heal]]).toEqual([2, 0]);
      sMovement.remove(orc1); // // manual remove to prevent dead body movement
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([4, 3, 6]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([13, -1, 5]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, false, true]);
      expect([time[mine], time[heal]]).toEqual([1, 3]);
      loc[mine] = 3;
      loc[heal] = 6;
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([5, 3, 5]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([11, -1, 2]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, false, true]);
      expect([time[mine], time[heal]]).toEqual([0, 2]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([6, 3, 4]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([11, -1, 2]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, false, true]);
      expect([time[mine], time[heal]]).toEqual([0, 1]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([7, 3, 3]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([11, -1, -1]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, false, false]);
      expect([time[mine], time[heal]]).toEqual([3, 0]);
      sMovement.remove(orc2); // manual remove to prevent dead body movement
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([8, 3, 3]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([11, -1, -1]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, false, false]);
      expect([time[mine], time[heal]]).toEqual([2, 0]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([9, 3, 3]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([11, -1, -1]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, false, false]);
      expect([time[mine], time[heal]]).toEqual([1, 0]);
    });

    it('should test movement, colliding and damage systems', () => {
      const [player, orc1, orc2] = [
        createMob(4, 2, 'warrior', 10, 3),
        createMob(8, -2, 'orc', 5, 2),
        createMob(2, 1, 'orc', 5, 4),
      ];
      const { storage: { loc } } = cLocation;
      const { storage: { hp, active } } = cStats;
      sMovement.add(player, orc1, orc2);
      sDamage.add(player, orc1, orc2);
      sCollide.add(player, orc1, orc2);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([6, 6, 3]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([8, 2, 5]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, true, true]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([8, 4, 4]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([8, 2, 5]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, true, true]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([10, 2, 5]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([12, 0, 6]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([10, -2, 7]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([8, 0, 8]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([4, 2, 2]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, true, true]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([6, 2, 9]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([4, 4, 10]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([4, -1, 2]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, false, true]);
      sMovement.remove(orc1); // manual remove to prevent dead body movement
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([2, 4, 11]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([0, 4, 10]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([-2, 4, 9]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([0, 4, 8]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([2, 4, 7]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([4, 4, 6]);
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([6, 4, 5]);
      loc[orc2] = 9; // small tp to finish fight
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([8, 4, 8]);
      expect([hp[player], hp[orc1], hp[orc2]]).toEqual([4, -1, -1]);
      expect([active[player], active[orc1], active[orc2]]).toEqual([true, false, false]);
      sMovement.remove(orc2); // manual remove to prevent dead body movement
      step();
      expect([loc[player], loc[orc1], loc[orc2]]).toEqual([10, 4, 8]);
    });

  });
  describe('ContinualList', () => {
    it('test api', () => {
      const list = new ContinualList({ x: -1, y: -1, name: '', removed: true });
      const { data: state } = list; // actualy we can make module without classes using pointers
      const create = (x, y, name) => ({ x, y, name, removed: false });
      const [player, box1, box2, enemy1, enemy2] = list.push(
        create(10, 10, 'warrior'),
        create(100, 10, 'box'),
        create(40, 30, 'box'),
        create(40, 40, 'orc'),
        create(60, 10, 'orc'),
      );
      expect(player).toBe(0);
      expect(state.length).toBe(5);
      expect(list.length).toBe(5);
      // move player to box2 to get enemy1
      state[player].x += 30;
      expect(state[player].x == state[enemy1].x).toBe(true);
      // kill enemy1, but enemy2 becomes agro...
      list.delete(enemy1);
      state[enemy2].x -= 20;
      expect(state[player].x == state[enemy2].x).toBe(true);
      // state[enemy1].remove - interesting approach to: just enhance items with additional methods
      // actually pointer-based ECS can be built on top of this
      // ...and breaks all the boxes
      list.delete(box1, box2);
      expect(list.vacant).toEqual([5, enemy1, box1, box2]);
      expect(state.length).toBe(5);
      expect(list.length).toBe(2);
      // player kills enemy2 and new level is loaded
      list.delete(enemy2);
      list.push(
        create(20, 20, 'box'),
        create(30, 20, 'box'),
        create(40, 30, 'box'),
        create(50, 30, 'box'),
        create(25, 10, 'orc'),
        create(45, 10, 'orc'),
      );
      expect(list.vacant).toEqual([7]);
      expect(state.length).toBe(7);
      expect(list.length).toBe(7);
      expect(state[player].name).toBe('warrior');
    });
    it('test flow', () => {
      const list = new ContinualList('');
      list.push('a');
      expect(list.data[0]).toBe('a');
      list.push('some value');
      list.push('b');
      expect(list.data).toEqual(['a', 'some value', 'b']);
      expect(list.data.length).toBe(3);
      list.data[2] = 'new value';
      expect(list.data).toEqual(['a', 'some value', 'new value']);
      list.push('item 1');
      list.push('item 2');
      expect(list.data.length).toBe(5);
      list.push('item 3');
      list.push('item 4');
      expect(list.data).toEqual(['a', 'some value', 'new value', 'item 1', 'item 2', 'item 3', 'item 4']);
      expect(list.data.length).toBe(7);
      list.delete(1, 2);
      list.delete(5);
      expect(list.data).toEqual(['a', '', '', 'item 1', 'item 2', '', 'item 4']);
      expect(list.data.length).toBe(7);
      list.push('1');
      expect(list.data).toEqual(['a', '', '', 'item 1', 'item 2', '1', 'item 4']);
      expect(list.data.length).toBe(7);
      list.push('2', '3');
      expect(list.data).toEqual(['a', '3', '2', 'item 1', 'item 2', '1', 'item 4']);
      expect(list.data.length).toBe(7);
      list.push('4', '5');
      expect(list.data).toEqual(['a', '3', '2', 'item 1', 'item 2', '1', 'item 4', '4', '5']);
      expect(list.data.length).toBe(9);
      list.delete(3, 4, 6);
      expect(list.data).toEqual(['a', '3', '2', '', '', '1', '', '4', '5']);
      expect(list.data.length).toBe(9);
      expect(list.vacant).toEqual([9, 3, 4, 6]);
      list.delete(1, 2, 5);
      expect(list.data).toEqual(['a', '', '', '', '', '', '', '4', '5']);
      expect(list.data.length).toBe(9);
      list.push('b', 'c', 'd', '1', '2', '3', '4', '5');
      expect(list.data).toEqual(['a', 'd', 'c', '3', '2', 'b', '1', '4', '5', '4', '5']);
      expect(list.data.length).toBe(11);
      expect(list.vacant).toEqual([11]);
    });
  });
})















