# Sculpts two hands as sphere-swept limbs on a height field, then lights them.
# Pose follows Michelangelo's Creation of Adam (public domain): Adam limp and drooping, God's arm driving forward.
import numpy as np, cv2, sys
from PIL import Image
SS=1.0
W,H=1500,900; TX,TY=1320,430   # model origin (index fingertip) in image px
ys,xs=np.mgrid[0:H,0:W].astype(np.float32); xs=(xs-TX)/SS; ys=(ys-TY)/SS
def limb(pts,k=None):
    """pts: list of (x,y,z,r). returns height field of swept spheres"""
    out=np.full((H,W),-1e4,np.float32)
    for (a,b) in zip(pts[:-1],pts[1:]):
        ax,ay,az,ar=a;bx,by,bz,br=b
        dx,dy=bx-ax,by-ay;L=dx*dx+dy*dy+1e-6
        t=np.clip(((xs-ax)*dx+(ys-ay)*dy)/L,0,1)
        px=ax+t*dx;py=ay+t*dy;r=ar+(br-ar)*t;z=az+(bz-az)*t
        d2=(xs-px)**2+(ys-py)**2
        h=np.where(d2<r*r,z+np.sqrt(np.maximum(r*r-d2,0)),-1e4)
        out=np.maximum(out,h)
    return out
def smax(a,b,k):
    h=np.clip(.5+.5*(a-b)/k,0,1);return b+(a-b)*h+k*h*(1-h)
def build(parts,k_palm=26,k_f=5):
    palm=None
    for p in parts['palm']:
        h=limb(p);palm=h if palm is None else smax(palm,h,k_palm)
    out=palm
    for p,k in parts['fingers']:
        out=smax(out,limb([(x,y,z,r*1.17) for x,y,z,r in p]),k)
    return out
ADAM={'palm':[
 [(-1320,40,-30,118),(-980,-8,-14,104),(-680,-62,0,76),(-575,-92,4,66)],
 [(-585,-112,0,44),(-345,-92,10,40)],[(-585,-88,0,46),(-335,-50,10,42)],[(-590,-64,0,46),(-350,-8,6,40)],[(-590,-46,-2,40),(-385,30,0,35)],
 [(-500,-85,-6,60),(-400,-45,-4,62)]],
 'fingers':[
 ([(-500,-30,-26,44),(-440,48,-26,35),(-395,110,-22,27),(-360,142,-18,20)],7),   # thumb, tucked behind
 ([(-385,30,2,33),(-325,86,2,28),(-292,142,-4,23),(-272,186,-12,17)],5),         # little
 ([(-350,-8,6,36),(-268,48,6,31),(-222,120,0,27),(-196,184,-10,20)],5),           # ring
 ([(-335,-50,10,39),(-226,-12,10,34),(-152,62,4,29),(-112,134,-6,21)],5),         # middle
 ([(-345,-92,16,39),(-232,-82,16,34),(-122,-46,14,28),(-62,-20,12,24),(-14,-6,10,17)],5), # index, lifting
 ]}
GOD={'palm':[
 [(-1320,-212,-30,112),(-1000,-146,-14,100),(-700,-72,0,72),(-590,-52,4,64)],
 [(-600,-68,0,44),(-352,-44,12,40)],[(-600,-44,0,46),(-345,-2,12,42)],[(-604,-22,0,46),(-356,38,8,40)],[(-604,-6,-2,40),(-382,72,2,35)],
 [(-510,-46,-6,58),(-410,-10,-4,62)]],
 'fingers':[
 ([(-520,10,-26,44),(-455,78,-26,36),(-385,124,-22,28),(-318,134,-16,20)],7),     # thumb
 ([(-382,72,2,32),(-322,116,2,27),(-296,160,-6,22),(-304,198,-14,16)],5),         # little, curled
 ([(-356,38,8,36),(-276,84,8,31),(-234,142,0,26),(-246,190,-12,19)],5),           # ring, curled
 ([(-345,-2,12,39),(-238,40,12,34),(-178,106,4,28),(-182,164,-10,20)],5),         # middle, curled
 ([(-352,-44,18,39),(-232,-30,18,34),(-118,-14,16,28),(-52,-6,14,23),(-12,-2,12,17)],5), # index, straight
 ]}
def shade(hf):
    alpha=(hf>-5000).astype(np.float32)
    h=np.where(hf>-5000,hf,-140).astype(np.float32)
    h=cv2.GaussianBlur(h,(0,0),3.2)
    gx=cv2.Sobel(h,cv2.CV_32F,1,0,ksize=3)/8;gy=cv2.Sobel(h,cv2.CV_32F,0,1,ksize=3)/8
    n=np.dstack([-gx,-gy,np.ones_like(gx)]);n/=np.linalg.norm(n,axis=2,keepdims=True)
    L=np.array([-.38,-.62,.68]);L/=np.linalg.norm(L)
    dif=np.clip((n*L).sum(2),0,1)
    ao=np.clip(1-(cv2.GaussianBlur(h,(0,0),16)-h)/34,0.25,1)   # creases between fingers and tendons
    spec=np.clip((n*(L+np.array([0,0,1]))/np.linalg.norm(L+np.array([0,0,1]))).sum(2),0,1)**22
    lum=(.14+.82*dif)*ao+.24*spec
    lum=np.clip(lum,0,1)
    a=cv2.GaussianBlur(alpha,(0,0),.8)
    return lum,a
for name,parts,flip in [('adam',ADAM,False),('god',GOD,True)]:
    lum,a=shade(build(parts))
    img=np.dstack([lum*255]*3+[a*255]).astype(np.uint8)
    if flip: img=img[:,::-1]
    Image.fromarray(img,'RGBA').resize((1000,600),Image.LANCZOS).save(f'../assets/{name}.png')
