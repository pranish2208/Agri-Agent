import math
import re
from typing import List, Dict, Any, Optional
from collections import Counter


class Document:
    def __init__(self, doc_id: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        self.doc_id = doc_id
        self.content = content
        self.metadata = metadata or {}
        self.tokens = self._tokenize(content)

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        # Lowercase and extract alphanumeric words
        clean_text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        tokens = [w for w in clean_text.split() if len(w) > 2]
        return tokens


class AgriVectorStore:
    """
    Lightweight, high-performance in-memory vector and BM25/TF-IDF retrieval store.
    No heavy C-extension or binary dependency required; deterministic and fast.
    """
    def __init__(self):
        self.documents: Dict[str, Document] = {}
        self.doc_frequencies: Counter = Counter()
        self.total_docs: int = 0
        self.avg_doc_length: float = 0.0

    def add_document(self, doc_id: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        doc = Document(doc_id, content, metadata)
        self.documents[doc_id] = doc
        self._rebuild_index()

    def add_documents(self, docs: List[Dict[str, Any]]):
        for d in docs:
            doc = Document(d["doc_id"], d["content"], d.get("metadata", {}))
            self.documents[d["doc_id"]] = doc
        self._rebuild_index()

    def _rebuild_index(self):
        self.total_docs = len(self.documents)
        if self.total_docs == 0:
            return

        self.doc_frequencies = Counter()
        total_tokens = 0
        for doc in self.documents.values():
            unique_tokens = set(doc.tokens)
            for token in unique_tokens:
                self.doc_frequencies[token] += 1
            total_tokens += len(doc.tokens)

        self.avg_doc_length = total_tokens / self.total_docs

    def search(
        self,
        query: str,
        top_k: int = 5,
        crop_filter: Optional[str] = None,
        category_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        BM25-based semantic lexical ranking with metadata filters.
        """
        if self.total_docs == 0:
            return []

        query_tokens = Document._tokenize(query)
        if not query_tokens:
            return []

        # BM25 Parameters
        k1 = 1.5
        b = 0.75

        scores = []
        for doc_id, doc in self.documents.items():
            # Apply crop filter if provided
            if crop_filter:
                doc_crop = str(doc.metadata.get("crop", "")).lower()
                target_crop = crop_filter.lower()
                if doc_crop and target_crop not in doc_crop and doc_crop not in target_crop:
                    # Allow general soil/nutrient documents even if crop specified
                    if doc.metadata.get("category") not in ["soil", "general_nutrient"]:
                        continue

            # Apply category filter if provided
            if category_filter:
                doc_cat = str(doc.metadata.get("category", "")).lower()
                if doc_cat != category_filter.lower():
                    continue

            # Compute BM25 score
            doc_len = len(doc.tokens)
            if doc_len == 0:
                continue

            doc_token_counts = Counter(doc.tokens)
            score = 0.0

            for q_token in query_tokens:
                if q_token not in doc_token_counts:
                    continue

                freq = doc_token_counts[q_token]
                n_q = self.doc_frequencies.get(q_token, 0)
                # Robertson-Spärck Jones IDF
                idf = math.log((self.total_docs - n_q + 0.5) / (n_q + 0.5) + 1.0)
                numerator = freq * (k1 + 1)
                denominator = freq + k1 * (1 - b + b * (doc_len / (self.avg_doc_length or 1.0)))
                score += idf * (numerator / (denominator or 1.0))

            # Bonus score for direct phrase or keyword presence in title/tags
            title = str(doc.metadata.get("title", "")).lower()
            tags = [str(t).lower() for t in doc.metadata.get("tags", [])]
            for q_token in query_tokens:
                if q_token in title:
                    score += 1.5
                if any(q_token in tag for tag in tags):
                    score += 0.8

            if score > 0.0:
                scores.append({
                    "doc_id": doc.doc_id,
                    "score": round(score, 4),
                    "content": doc.content,
                    "metadata": doc.metadata
                })

        scores.sort(key=lambda x: x["score"], reverse=True)
        return scores[:top_k]
