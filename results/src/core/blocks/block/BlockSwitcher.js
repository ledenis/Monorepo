import React, { useState } from 'react'
import PropTypes from 'prop-types'
// import globalBlockRegistry from 'core/helpers/blockRegistry'
import blockRegistry from 'Config/blocks'
import { keys } from 'core/bucket_keys'
import isEmpty from 'lodash/isEmpty'
import Block from 'core/blocks/block/BlockVariant'
import get from 'lodash/get'
import { usePageContext } from 'core/helpers/pageContext'
import { BlockError } from 'core/blocks/block/BlockError'
import dataFunctions from 'core/data_functions/index'

const BlockSwitcher = ({ pageData, block, index, ...props }) => {
    let blockData = block.dataPath && get(pageData, block.dataPath)
    if (block.dataFunction) {
        const dataFunction = dataFunctions[block.dataFunction]
        blockData = dataFunction(blockData)
    }
    const [customData, setCustomData] = useState()

    let blockKeys = block.keysPath && get(pageData, block.keysPath)
    const pageContext = usePageContext()
    const { id, blockType, hidden } = block
    if (!blockRegistry[blockType]) {
        return (
            <BlockError
                block={block}
                message={`Missing Block Component! Block ID: ${id} | type: ${blockType}`}
            />
        )
    }
    const BlockComponent = blockRegistry[blockType]
    if (block.dataPath && (!blockData || blockData === null || isEmpty(blockData))) {
        // console.log(pageData)
        // console.log(block.dataPath)
        return (
            <BlockError
                block={block}
                message={`No available data for block ${id} | path: ${block.dataPath} | type: ${blockType}`}
            >
                <textarea>{JSON.stringify(pageData, undefined, 2)}</textarea>
            </BlockError>
        )
    }

    const blockEntity = block.entityPath && get(pageData, block.entityPath)

    const customChart = customData && (
        <BlockComponent
            block={{ ...block, entity: blockEntity, chartOnly: true }}
            pageData={pageData}
            data={customData}
            entity={blockEntity}
            keys={blockKeys}
            index={index}
            {...props}
        />
    )

    return (
        <BlockComponent
            block={{ ...block, entity: blockEntity, setCustomData, customData, customChart }}
            pageData={pageData}
            data={blockData}
            entity={blockEntity}
            keys={blockKeys}
            index={index}
            {...props}
        />
    )
}

BlockSwitcher.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        blockType: PropTypes.oneOf(Object.keys(blockRegistry)).isRequired,
        // key used to pick the block's data from the page's data
        dataPath: PropTypes.string,
        // key used to pick bucket keys
        bucketKeysName: PropTypes.oneOf([...Object.keys(keys), 'country']),
        // enable/disable block description
        showDescription: PropTypes.bool,
        // which mode to use for generic bar charts
        mode: PropTypes.oneOf(['absolute', 'relative']),
        // which unit to use for generic bar charts
        units: PropTypes.oneOf(['percentage', 'count'])
    }),
    pageData: PropTypes.any.isRequired
}

export default BlockSwitcher
