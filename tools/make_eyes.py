# Splits source/char1.png into the layers the moving eyes need:
#   assets/head_top.png  the face with the eye openings cut out
#   assets/sclera.png    the eyeballs, drawn under the irises (crop x 240-560, y 300-360)
# Run from this folder: python3 make_eyes.py   (needs numpy, opencv-python, pillow)
import numpy as np, cv2
from PIL import Image
src=np.array(Image.open('source/char1.png').convert('RGBA'));H,W=src.shape[:2]
POLY_L=[[259.5, 322.0], [265.5, 317.0], [275.0, 313.0], [286.2, 310.5], [300.0, 309.0], [312.5, 309.5], [323.8, 314.5], [332.5, 322.5], [340.0, 330.5], [343.8, 336.5], [335.0, 338.0], [325.0, 340.5], [310.0, 342.5], [295.0, 342.5], [282.5, 340.5], [271.2, 335.5], [263.8, 328.8]]
POLY_R=[[443.8, 335.0], [450.0, 327.5], [457.5, 321.2], [467.5, 314.5], [480.0, 310.5], [495.0, 309.5], [507.5, 310.5], [517.5, 314.5], [525.0, 320.5], [527.5, 326.2], [522.5, 332.0], [512.5, 337.5], [500.0, 340.5], [482.5, 341.8], [465.0, 341.0], [452.5, 338.5]]
WHITE=np.array([222,212,204],np.float32);SHADOW=np.array([158,136,130],np.float32)  # eye-white colour lives here
def rast(p):
    m=np.zeros((H*4,W*4),np.uint8);cv2.fillPoly(m,[np.round(np.array(p)*4).astype(np.int32)],255,cv2.LINE_AA)
    return cv2.resize(m,(W,H),interpolation=cv2.INTER_AREA).astype(np.float32)/255
hole=np.maximum(cv2.GaussianBlur(rast(POLY_L),(0,0),.7),cv2.GaussianBlur(rast(POLY_R),(0,0),.7))
top=src.copy();top[...,3]=(src[...,3]*(1-hole)).astype(np.uint8)
Image.fromarray(top,'RGBA').save('../assets/head_top.png')
out=np.zeros((H,W,4),np.float32);yy,_=np.mgrid[0:H,0:W].astype(np.float32)
for poly in (POLY_L,POLY_R):
    m=rast(poly);p=np.array(poly);y0,y1=p[:,1].min(),p[:,1].max();t=np.clip((yy-y0)/(y1-y0),0,1)
    k=np.clip(t/.55,0,1)[...,None];edge=np.clip(cv2.GaussianBlur(m,(0,0),2.6)*1.6,0,1)[...,None]
    col=(SHADOW*(1-k)+WHITE*k)*(.78+.22*edge)
    g=cv2.GaussianBlur(cv2.dilate(m,np.ones((5,5))),(0,0),.6);sel=g[...,None]>out[...,3:]/255
    out[...,:3]=np.where(sel,col,out[...,:3]);out[...,3]=np.maximum(out[...,3],g*255)
Image.fromarray(np.clip(out,0,255).astype(np.uint8),'RGBA').crop((240,300,560,360)).save('../assets/sclera.png')
