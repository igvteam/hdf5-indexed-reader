# hdf5-indexed-reader

## Summary

hdf-indexed-reader is a module for efficient querying of HDF5 files over the web. It enables loading of individual
datasets from remote files without the need to load the entire file into memory. It works in
conjunction with the companion project [hdf5-indexer](https://github.com/jrobinso/hdf5-indexer), which annotates
HDF5 files with an index mapping object path names to file offsets.

The module is built on a fork of [jsfive](https://github.com/usnistgov/jsfive). The fork is available at
https://github.com/jrobinso/hdf5-indexed-reader.

## Motivation

The driving use case for this project involves extracting individual datasets for visualization in a web browser
from large HDF5 files (~200 GB) containing 10s of thousands of individual datasets. Loading such files over
the web with available solutions present 2 problems

* The file is too large to load into browser memory in its entirety

* Finding the file offset for the object desired involves walking a linked list of nodes of containing and sibling
  objects
  These nodes can be located anywhere in the file, resulting in an explosion of http range requests which can quickly
  freeze the application.

This project addresses these issues by (1) using range queries to load slices of the file as needed, and (2) supporting
a pre-built index for mapping object (groups and datasets) paths to file offsets, negating the need to walking the
linked list of container objects to build the index at runtime..

## Limitations

* As this project is based on [jsfive](https://github.com/usnistgov/jsfive), some limitations of that tool apply here,
  namely not all datatypes are supported.

* This reader is designed for large HDF5 files containing many datasets. Small files will likely not  
  benefit from indexing and incremental loading. Additionally, the benefit of indexing is reduced if the number
  of datasets is small.

## Build

```
npm run install
npm run build
```

The build creates 3 packages

* hdf5-indexed-reader.esm.js - an ES module for use in a web browser
* hdf5-indexed-reader.node.cjs - a common JS module for use with Node
* hdf5-indexed-reader.node.mjs - an ES module for use with Node

## Usage

The module exports a single function, ```openH5File( {options} )```. The HDF5 file is specified with one of the
following
properties

* url - url to the hdf5 file
* path - local file path, **Node only**
* file - browser `File` or other `Blob` like object

URL fetches are cached to avoid separate individual requests for small amounts of data. The following optional
properties controls
the cache

* fetchSize - minimum size in bytes for each http request. Defaults to 2000  (2 kb)
* maxSize - the maximum number of bytes to cache. Default value is 200000  (200 kb)

In cases where it is not possible to modify the HDF5 file [hdf5-indexer](https://github.com/jrobinso/hdf5-indexer) can
create an external index as a json file.  This file can be used with one of the following properties

* indexURL - url to index json file
* indexPath - local file path, `node` only
* indexFile - browser `File` object

## Example

Load a `Dataset` from a remote HDF5 file and fetch its shape, data type, and values.

```js
import {openH5File} from "dist/esm/hdf5-indexed-reader.esm.js"

const hdfFile = await openH5File({
    url: "https://www.dropbox.com/s/53fbs3le4a65noq/spleen_1chr1rep.indexed.cndb?dl=0",
})

const spatialPostionDataset = await hdfFile.get('/replica10_chr1/spatial_position/1149')
const shape = await spatialPostionDataset.shape
const dtype = await spatialPostionDataset.dtype
const values = await spatialPostionDataset.value

```

See examples folder for node cjs and es examples.




