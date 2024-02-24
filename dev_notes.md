## World and levels
we need multiple maps: for display, for collision
having "mapping" in each level I will face a lot of duplicated lines
lets have only level data in level object
so split leveldata in 2:
1. cellMap,
2. cellData,
Also I need to handle background and foreground layers with paralax effect (but do I need to put it in level data?)

#### Broad phase
1. get player current cx, cy
2. collide with left, top, right, 


## Collisions detection
side  vx    x       y       r       bx  br
left  1.034 191.700 160.462 207.700 144 192
left  4.999 191.686 160.508 207.686 144 192
left  4.998 191.711 160.483 207.711 144 192
left -4.999 191.710 160.481 207.710 144 192
left -5.000 191.729 160.464 207.729 144 192

bwidth = 48
side   vx    x       y       ly      r       bx  br  b
right  5.000 272.435 160.000 160.000 288.435 288 336 10
right -4.997 224.088 160.000 160.000 240.088 240 288 8
 left  4.780 143.695 160.532 160.000 159.695 96  144 2
 left  1.033 191.981 160.535 160.532 207.981 144 192 4
 left -3.887 191.579 160.459 160.000 207.579 144 192 4
right  3.970 272.338 160.000 160.000 288.338 288 336 10
right -3.998 224.445 160.000 160.000 240.445 240 288 8

Root cause:
y - 160.524
which causes collision

## Bitmap
#### Ideas
- Bitmap with shared buffer (abiliy to draw part, but modify source)
- Bitmap with indexes instead of pixels (partialy done)
#### copy
   0  1  2  3  4  5  6
0  01 02 03 04 05 06 07
1  08 09 10 11 12 13 14
2  15 16 17 18 19 20 21
3  22 23 24 25 26 27 28
4  29 30 31 32 33 34 35
5  36 37 38 39 40 41 42
6  43 44 45 46 47 48 49

  1:2  3-2
  16, 17, 18
  23, 24, 25

D0C0B0
907F70
8A7A6B
484038

908070
b09080
d0a090

908070
707060
506050
305040

F5A623

E0A030
D04020
=======
    1:2  3-2
    16, 17, 18
    23, 24, 25

#### pallete and color manipulation
Option A
    All bitmaps stores indexes not actual pixels
    Viewport bitmap applies pixels on indexes
    + realtime manipulation
    - additional lookup on each frame, but lookup is O(1)
    - need to handle this
    How it can be, example:
        ( Need to have 2 bitmaps for static, and 1 for player )
        have array of collors (pallete)
        on image load(bitmap creation) store unique colors to pallete and create bitmap with indexes


palleteData = actual colors: [0xfff, 0x452, 0xf24]
palleteMap = readonly map of indexes [1, 0, 0, 2, 1]

what remap do:
for all pixels in Bitmap set color of Data[Map[i]]


#### TileableBitmap
TileableBitmap.reorder:
A B C
D E F
[2 2 3 3] cols = 2
C C
D D
TODO:
ability to create TileableBitmap from Bitmaps array (join)

#### Animated BG notes
TODO:
1. remake to include +1 color for shade (etc)
2. make all tiles compatible (smooth at the ends)
3. reorder allow us to make variations








#### TODOS
// TODO: #newECS: how we can make dynamic component arguments using TS types, to achive this API:
// const entity = em.create(x, y, w, h) // where x & y and w & h is separate components

