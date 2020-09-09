# Cubic B-spline interpolation
Segmentation task dataset 구축을 위한 manual labeling 과정에서 주어진 점들로부터, 점들을 지나는 부드러운 곡선을 생성하는 javascript 코드입니다.

## Demo Site
https://artiq.synology.me:909/

## Theory
저희가 생성하는 곡선은 Centripetal Catmull-Rom spline으로 다음의 위키피디아 링크 https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline[https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline] 에 자세한 그림과 설명이 주어져 있습니다.

제시되어 있는 세가지 방법 중에서는 Uniform (α=0), Chordal (α=1)이 아닌 **Centripetal (α=1/2)** 방법을 적용하였는데, 저희가 실험해본 결과 Centripetal이 가장 적합한 모양의 곡선을 만들어내는 것으로 판단되었기 때문입니다.