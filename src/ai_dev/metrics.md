# size 16 grey scale hash, old dhash comparison code, increase brightness on dark cards, webgpu model

task | time
---|---
load cv | 0.03700ms
load image and get data | 30.79ms
preprocessing | 3.429ms
inference | 99.85ms
post-processing | 5.014ms
card extraction | 26.04ms
load classifier | 12.13ms
classify card | 93.41ms
cleanup | 0.01300ms

Accuracy: 0.930
Precision: 0.930
Recall: 1.000
F1 Score: 0.964

#  size 16 RGB hash, new dhash comparison code, increase brightness on dark cards, webgpu model

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

Accuracy: 0.96
Precision: 0.96
Recall: 1.00
F1 Score: 0.98

# size 12 RGB hash

Accuracy: 0.930
Precision: 0.930
Recall: 1.000
F1 Score: 0.964

# size 20 RGB hash

Accuracy: 0.945
Precision: 0.945
Recall: 1.000
F1 Score: 0.972

conclusion: we don't have enough positional precision to make use of a more detailed hash