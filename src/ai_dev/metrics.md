# data: 200 artificial images with cards

conclusion:

splitting each image into its separate color channels, creating a hash for each, and appending the hashes together leads to a higher accuracy

changing the hash size above or below 16 decreased the accuracy, the assumption is there isn't enough positional precision to make use of a more detailed hash

## size 16 grey scale hash, old dhash comparison code, increase brightness on dark cards, webgpu model

task | time
---|---
load cv | 0.03700ms
load image and get data | 30.79ms
preprocessing | 3.429ms
inference | 99.85ms
post-processing | 5.014ms
card extraction | 26.04ms
load classifier | 12.13mshttps://open.spotify.com/album/3xd4BgfNOtHQD8CqTGKcif
classify card | 93.41ms
cleanup | 0.01300ms

metric | score
---|---
Accuracy: | 0.930
Precision: | 0.930
Recall: | 1.000
F1 Score: | 0.964

##  size 16 RGB hash, new dhash comparison code, increase brightness on dark cards, webgpu model

task | time
---|---
load cv | 0.003ms
load image and get data | 15.45ms
preprocessing | 2.011ms
inference | 79.38ms
post-processing | 3.034ms
card extraction | 17.86ms
load classifier | 6.167ms
classify card | 13.41ms
cleanup | 0.008ms

metric | score
---|---
Accuracy: | 0.96
Precision: | 0.96
Recall: | 1.00
F1 Score: | 0.98

## size 12 RGB hash

metric | score
---|---
Accuracy: | 0.930
Precision: | 0.930
Recall: | 1.000
F1 Score: | 0.964

## size 20 RGB hash

metric | score
---|---
Accuracy: | 0.945
Precision: | 0.945
Recall: | 1.000
F1 Score: | 0.972


# data: 400 artificial images, half with cards, half without

## with yolo threshold = 0.5, no hash threshold

metric | score
---|---
Accuracy: | 0.975
Precision: | 0.990
Recall: | 0.960
F1 Score: | 0.975

## with yolo threshold = 0.6, hash threshold = 0.25

metric | score
---|---
Accuracy: | 0.990
Precision: | 1.000
Recall: | 0.980
F1 Score: | 0.990

subjective: now no cards are being confidently miss classified, and not a single non-card image was identified as having a card. only error remaining is not finding the card

# ROC on testcurve2 dataset

## no hash threshold, variable yolo threshold

threshold,FPR,TPR
data = [
    [0.00, 1.000, 1.000],
    [0.03, 0.750, 1.000],
    [0.05, 0.700, 1.000],
    [0.57, 0.650, 1.000],
    [0.63, 0.600, 1.000],
    [0.75, 0.500, 0.900],
    [0.78, 0.450, 0.900],
    [0.88, 0.300, 0.900],
    [0.93, 0.200, 0.900],
    [0.97, 0.100, 0.500],
    [1.00, 0.000, 0.000],
]

## variable hash threshold, 0.6 yolo threshold

Threshold: 0.03, TPR: 0.000, FPR: 0.000
Threshold: 0.05, TPR: 0.000, FPR: 0.000
Threshold: 0.07, TPR: 0.000, FPR: 0.000
Threshold: 0.10, TPR: 0.000, FPR: 0.000
Threshold: 0.13, TPR: 0.100, FPR: 0.000
Threshold: 0.15, TPR: 0.300, FPR: 0.000
Threshold: 0.17, TPR: 0.650, FPR: 0.000
Threshold: 0.20, TPR: 0.750, FPR: 0.000
Threshold: 0.23, TPR: 0.800, FPR: 0.000
Threshold: 0.25, TPR: 0.900, FPR: 0.000
Threshold: 0.28, TPR: 0.950, FPR: 0.000
Threshold: 0.30, TPR: 1.000, FPR: 0.000
Threshold: 0.33, TPR: 1.000, FPR: 0.050
Threshold: 0.35, TPR: 1.000, FPR: 0.050
Threshold: 0.38, TPR: 1.000, FPR: 0.100
Threshold: 0.40, TPR: 1.000, FPR: 0.450
Threshold: 0.42, TPR: 1.000, FPR: 0.750

threshold,FPR,TPR
data = [
    [0.000, 0.000, 0.000]
    [0.30, 0.000, 1.000],
    [0.33, 0.050, 1.000],
    [0.38, 0.100, 1.000],
    [0.40, 0.450, 1.000],
    [0.42, 0.750, 1.000],
    [1.000, 1.000, 1.000]
]