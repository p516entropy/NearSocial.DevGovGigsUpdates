![fuzzy-search-demo](https://user-images.githubusercontent.com/18199461/222934334-934e9f2c-09c5-4f25-a59a-1259954db801.gif)

NEAR Fuzzy Search widget
====

## Overview

The widget implements a fuzzy matching algorithm that can handle typos, making it easier for users to find relevant posts quickly.


## Features
The following features have been implemented in the widget:

- Indexer: The application indexes all posts on DevGovGigs, making them searchable.
- Stemming: The application uses stemming to improve search results by matching variations of the same word (e.g., search results for "programming" will also include results for "programmer").
- Stop words filter: The application filters out common words such as "a", "an", and "the" from search queries to improve search accuracy.
- Spellcheck: The application includes a spellcheck feature that suggests alternate spellings for search queries that don't match any results.
- Search by author_id, post_type, name, description, labels: The widget allows users to conduct search results by various attributes of the post.
- Quick load with few requests for search results: The widget loads search results quickly with a minimal number of requests to the blockchain.
- InfiniteScroll for search result: The application includes an InfiniteScroll feature that loads additional search results as the user scrolls down the page.

## Getting Started
Go to https://near.social/#/p516entropy.near/widget/PostsFuzzySearch and type in the search bar anything you're looking for.
- Example: `code eterium hakk on hakaton about zk`

## License
The widget is licensed under the MIT License.
