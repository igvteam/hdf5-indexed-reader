import {assert} from 'chai'
import {openH5File} from "../src/open.js"
import {Dataset} from "../src/jsfive/index.mjs"

class BufferWrapper {
    constructor(buffer) {
        this.buffer = buffer
    }

    async slice(start, end) {
        console.log(`slice ${start}  ${start - end}`)
        return this.buffer.slice(start, end)
    }

}

suite("test", function () {


    test("cndb - internal index -- remote", async function () {

        this.timeout(100000)
        const startTime = Date.now()

        const remoteConfig = {
            url: "https://www.dropbox.com/s/53fbs3le4a65noq/spleen_1chr1rep.indexed.cndb?dl=0",
        }

        await testCNDB(remoteConfig)

        console.log(`cndb - use index -- remote finished in ${Date.now() - startTime} ms`)

    })


    // test("cndb - use index -- 127 GB remote", async function () {
    //
    //     this.timeout(100000)
    //     const startTime = Date.now()
    //
    //     const config = {
    //         indexPath: require.resolve("./spleen_full.index.json"),
    //         url: "https://www.dropbox.com/s/o0evglziffzlqzo/spleen_full.cndb?dl=0"
    //     }
    //
    //     console.log("Open file")
    //     const hdfFile = await openH5File(config)
    //     console.log(`File opened in ${Date.now() - startTime} ms`)
    //
    //
    //     console.log("Get spatial position group")
    //     const group = await hdfFile.get('/replica10_chr16/spatial_position')
    //     //console.log(group.keys)
    //
    //     console.log("Get first dataset")
    //     const time1 = Date.now()
    //     const dataset1 = await group.get('11')
    //     const values1 = await dataset1.value
    //     console.log(`First dataset (${values1.length} elements) loaded in  ${Date.now() - time1} ms`)
    //
    //     console.log("Start second dataset")
    //     const time2 = Date.now()
    //     const dataset2 = await group.get('11')
    //     const values2 = await dataset2.value
    //     console.log(`Second dataset (${values2.length} elements) loaded in  ${Date.now() - time2} ms`)
    //
    //     console.log(`cndb - use index -- 6 GB remote finished in ${Date.now() - startTime} ms`)
    //
    // })
    //
    async function testCNDB(config) {

        const time1 = Date.now()

        const hdfFile = await openH5File(config)

        console.log(`File opened in ${Date.now() - time1} ms`)

        // fetch root group
        const rootGroup = await hdfFile.get('/')
        const rootKeys = new Set(rootGroup.keys)
        assert.isTrue(rootKeys.has('Header'))
        assert.isTrue(rootKeys.has('replica10_chr1'))


        // fetch first group
        const group = await hdfFile.get('/replica10_chr1')

        // Genomic positions dataset
        const genomicPosition = await group.get('genomic_position')
        const shape = await genomicPosition.shape
        const array = await genomicPosition.value
        assert.equal(shape.length, 2)
        assert.equal(shape[0], 4980)
        assert.equal(shape[1], 2)
        assert.equal(await genomicPosition.dtype, '<i8')
        assert.equal(array.length, 9960)
        assert.equal(array[0], 1)
        assert.equal(array[9959], 249000001)

        // fetch spatial position group
        const spatialPosition = await group.get('spatial_position')


        // Spatial position keys (1 for each dataset)
        const keys = spatialPosition.keys
        assert.equal(keys.length, 9999)

        // first dataset
        const sp1 = await spatialPosition.get(keys[0])

        const s1 = await sp1.shape
        assert.equal(s1.length, 2)
        assert.equal(s1[0], 4980)
        assert.equal(s1[1], 3)

        const t1 = await sp1.dtype
        assert.equal(t1, '<f4')

        const values1 = await sp1.value
        assert.equal(values1.length, s1[0] * s1[1])
        assert.equal(values1[0], 3.463745594024658)
        assert.equal(values1[values1.length - 1], 4.335586071014404)

        // Second dataset
        const time2 = Date.now()
        const sp2 = await spatialPosition.get('1149')

        const s2 = await sp2.shape
        assert.equal(s1.length, 2)
        assert.equal(s2[0], 4980)
        assert.equal(s2[1], 3)

        const t2 = await sp2.dtype
        assert.equal(t2, '<f4')

        const values2 = await sp2.value
        assert.equal(values2.length, s1[0] * s1[1])
        assert.equal(values2[0], 7.750027179718018)
        assert.equal(values2[values1.length - 1], 6.615085124969482)

        console.log(`Second dataset loded in ${Date.now() - time2} ms`)

    }

})
