# Anatomy model attribution

BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan.

- Original dataset: [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html), release 3.0 (20110915), polygon reduction 95%.
- Copy used: binary STL conversions of that release in [Kevin-Mattheus-Moerman/BodyParts3D](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D) (`assets/BodyParts3D_data/stl/`, commit `f0eeb6e`), which distributes the data under CC BY-SA 2.1 Japan.
- Retrieved: 2026-10-16. Every input file is pinned by SHA-256 in [manifest.json](manifest.json) and `scripts/model-inputs.json`.
- Model/data license: [CC BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en). `muscles.glb` is an adaptation and is shared under the same license.
- Original work: Mitsuhashi et al., “BodyParts3D: 3D structure database for anatomical concepts”, Nucleic Acids Research 37 (2009), D782–D785. [DOI](https://doi.org/10.1093/nar/gkn613).

Changes by OrganUI: selected 428 muscle and tendon meshes and combined them into 177 structures, welded duplicate STL vertices, simplified geometry to within 0.8 mm of the source with meshoptimizer, recentered and uniformly scaled coordinates, changed axes from Z-up to Y-up, recomputed smooth normals, assigned illustrative colors, and converted STL to GLB. No sculpting or invented anatomy.

The MIT license for original application code does not relicense this model or its derived screenshots. Preserve this attribution, the license link and the modification notice when redistributing the model or images of it. DBCLS does not endorse this demonstration. The source can contain missing or incorrect anatomical representations.

## Anatomy Quest distribution

This copy uses the unmodified OrganUI runtime GLB, pinned to commit `1c746c36d12a78c5f3fd452dbe5d29ae869cad04`. GLB SHA-256: `615ed2cf0d5ca9aa63f30bb806a65c740ed2ab057463a19505e19eff2bf207ce`.

Anatomy Quest changes display colors, selection, camera framing, visibility, and interface at runtime. Geometry is not edited. The data asset and images derived from it retain CC BY-SA 2.1 Japan. The whole-body surface includes 177 grouped muscle, tendon and related structures; left/right and some muscle heads are grouped. It is a static reference mesh, not a rigged musculoskeletal simulation. The separate joint motion diagrams are original schematic illustrations.

Learning summaries are original Korean factual summaries with individual references to University of Washington Muscle Atlas and NCBI Bookshelf, without reproducing their illustrations. Model geometry and teaching summaries are separate sources.
