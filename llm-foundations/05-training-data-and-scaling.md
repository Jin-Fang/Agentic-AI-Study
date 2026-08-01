# Chapter 5: Training Data and Scaling

Pretraining quality depends on the distribution of training data, the number and architecture of model parameters, and the compute used to optimize them. These factors interact: more parameters are useful only when the training run supplies enough suitable data and compute, while more tokens are useful only to the extent that they add learnable signal. Karpathy's deep dive begins with data collection and filtering because the training distribution is one of the main determinants of a model's capabilities and blind spots ([Deep Dive, around 00:01:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=88s)).

## Training Data Is a Constructed Distribution

A large pretraining corpus may include web pages, books, code, papers, discussions, and documentation. It may also contain duplicated templates, spam, broken text extraction, outdated claims, toxic material, personal data, and strong biases toward some languages and domains. A corpus is therefore not simply "the web." It is the output of a pipeline that turns collected sources into a distribution of token sequences.

FineWeb is a public example of this process. The deep dive uses it to show how Common Crawl-derived pages are transformed into a web-scale text dataset, with about 15 trillion tokens in the version discussed ([Deep Dive, around 00:01:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=88s)). Raw pages contain navigation menus, cookie banners, boilerplate, repeated mirrors, and extraction errors as well as useful text.

Dataset construction commonly includes:

- collecting snapshots and other source corpora;
- extracting and normalizing text;
- identifying language and content type;
- filtering low-quality, unwanted, or sensitive material;
- removing exact and near duplicates;
- assigning sampling weights to different sources;
- and tokenizing and packing the selected text for training.

The resulting distribution is deliberately constructed. It is neither a uniform sample of human knowledge nor a direct representation of truth.

## Filtering, Mixing, and Policy

Filters can be hard rules, statistical classifiers, or model-based quality scores. Every threshold creates tradeoffs. A strict quality filter may remove spam but also discard unusual dialects or specialist material; a loose filter may preserve breadth while admitting more noise. Karpathy uses language filtering as a concrete example: an English-focused dataset reduces non-English material by design ([Deep Dive, around 00:04:54](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=294s)).

After filtering, sources are mixed in chosen proportions. The mixture need not match the amount of raw data available. Code, mathematics, books, or a low-resource language can be upweighted; a very large but noisy web source can be downweighted. Upweighting a limited source may also cause its examples to be repeated more often during training.

These choices embed policy in the data. They influence which languages, domains, styles, viewpoints, and behavior patterns contribute most often to the gradient. As a result, competence is uneven: strong performance in one domain does not imply equally strong performance in another.

## Deduplication, Frequency, and Memorization

Repeated sequences receive repeated training weight. Exact copies, near-duplicate pages, quoted passages, and syndicated content can therefore make some text much more frequent than its apparent semantic importance would suggest.

Deduplication can operate at document, passage, or shorter-span level. It improves data efficiency and can reduce both verbatim memorization and overlap between training and evaluation data. It is not perfect: paraphrases and partially copied documents are difficult to identify, and some repeated structures are legitimate.

Memorization is correspondingly uneven rather than all-or-nothing. A model may reproduce a distinctive sequence that occurred many times while failing to recall a fact that appeared only rarely. Frequency is not the only factor—model size, context, optimization, and properties of the sequence also matter—and models can generalize patterns without storing exact copies. Deduplication changes the odds of memorization; it does not eliminate it.

## Coverage, Freshness, and Competence

Coverage has several dimensions: topic, language, time period, genre, code ecosystem, cultural setting, and level of difficulty. A model can sometimes generalize beyond examples seen in training, but sparse or poor-quality coverage usually provides less evidence from which to learn. Non-public information may have no representation in the corpus at all.

Collection dates are bounded and uneven. A nominal training cutoff is useful shorthand, but it should not be imagined as one clean timestamp: different sources may have been collected at different times, and pretraining and post-training datasets may have different date ranges. Once a checkpoint is trained, its parameters do not automatically change as the world changes.

Data freshness is therefore distinct from reasoning ability. Additional reasoning cannot reveal an event absent from the available information. Post-training can further shape which knowledge is expressed and how the model responds, but it cannot make coverage uniform.

## Scaling Laws

Across broad experimental ranges, language-model loss has followed approximate power-law relationships with parameter count, dataset size, and training compute. On log-log plots, the reducible part of loss often declines roughly along a straight line as one of these resources increases ([Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361)). This implies predictable but diminishing gains: multiplying a resource by a fixed factor tends to multiply excess loss by a roughly fixed factor, rather than producing unlimited improvement.

Scaling variables are coupled. A larger model can be undertrained if it sees too few tokens or receives too little optimization compute. A very large dataset cannot be fully exploited by a model or training run without sufficient capacity and compute. Data quality and mixture also affect the loss reached at a given scale.

## Compute-Optimal Training

For a dense Transformer, a useful first approximation is that training compute grows with the product of parameter count and the number of training tokens. Under a fixed compute budget, model size and token count must therefore be balanced.

The Chinchilla study found that many earlier large models were undertrained relative to their parameter count. Within its experimental setting, training a smaller model on more tokens could achieve lower loss at the same compute budget ([Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556)). Its often-cited estimate of roughly 20 training tokens per parameter is a result tied to particular models, data, and assumptions—not a universal constant. Architecture, data quality, repeated data, optimization, and the intended objective can all shift the best allocation.

"Compute-optimal" must therefore name the objective being optimized. The Chinchilla-style question asks how to minimize pretraining loss for a fixed training-compute budget. It does not by itself minimize latency, memory use, or the total compute consumed after deployment.

## Training Cost and Inference Cost

Training spends a large amount of compute to produce a checkpoint. Inference spends additional compute each time that checkpoint processes input and generates output. A simplified lifetime accounting is:

```text
C_total = C_train + Q * C_inference_per_request
```

where \(Q\) is the number of requests. The actual terms depend on parameter count, architecture, input and output lengths, hardware, numerical precision, and batching.

This distinction can change the preferred parameter-and-token allocation. When a checkpoint will be used many times, extra training of a smaller model can sometimes trade higher one-time cost for lower repeated inference cost. With few requests, or when the larger model's quality is required, the tradeoff can be different. Training-optimal and lifetime-compute-optimal are separate objectives.

## What Scaling Claims Do and Do Not Say

Scaling laws describe aggregate trends such as held-out cross-entropy loss. They do not guarantee that every task, benchmark, language, or capability improves smoothly. A thresholded metric can turn a gradual change in underlying performance into an apparently sudden "emergent" jump ([Are Emergent Abilities of Large Language Models a Mirage?](https://arxiv.org/abs/2304.15004)).

Observed behavior also depends on data mixture, architecture, tokenizer, optimization, and post-training—not parameter count alone. A larger model does not acquire information collected after its training data, and lower average loss does not imply uniformly better behavior. Empirical scaling relationships are strongest within the regimes in which they were measured; extrapolating far beyond them requires caution.

## Contamination

Benchmark contamination occurs when evaluation examples, close variants, answer keys, or detailed solution discussions appear in training data. Overlap can enter through pretraining or post-training, especially when public benchmarks and their solutions are widely copied online.

Contamination can make a score reflect recall of evaluation material as well as generalization to unseen cases. Ordinary deduplication does not fully solve the problem: removing repeated training documents is different from comparing training data against a benchmark and its variants. Contamination does not automatically invalidate every result, but it limits what a benchmark score alone can establish about generalization.

## Key Takeaways

- Training data is a constructed distribution shaped by collection, filtering, mixing, and policy choices.
- Deduplication changes effective frequency and memorization risk but cannot remove all overlap or memorization.
- Coverage varies across domains, languages, and time, and checkpoint parameters do not update automatically.
- Scaling laws describe useful aggregate trends, while compute-optimal training balances model size and training tokens for a stated objective.
- Training cost, repeated inference cost, and benchmark contamination set important boundaries on scaling claims.
