import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {rem, position, borderRadius, margin} from 'polished'
import {FiSearch, FiMove} from 'react-icons/fi'
import {Box, Input, Absolute} from '../../../shared/components'
import Divider from '../../../shared/components/divider'
import Flex from '../../../shared/components/flex'
import ImageEditor from './image-editor'
import theme from '../../../shared/theme'
import {convertToBase64Url} from '../utils/use-data-url'
import {IMAGE_SEARCH_PICK, IMAGE_SEARCH_TOGGLE} from '../../../../main/channels'
import FlipImage from './flip-image'
import {IconButton} from '../../../shared/components/button'

import {
  backgrounds,
  padding
} from 'polished'
import {Draggable, DragDropContext, Droppable} from 'react-beautiful-dnd'



const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}



function FlipPics({pics, onUpdateFlip}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pickedUrl, setPickedUrl] = useState('')

  const handleImageSearchPick = (_, data) => {
    const [{url}] = data.docs[0].thumbnails
    setPickedUrl(url)
  }

  useEffect(() => {
    global.ipcRenderer.on(IMAGE_SEARCH_PICK, handleImageSearchPick)
    return () => {
      global.ipcRenderer.removeListener(
        IMAGE_SEARCH_PICK,
        handleImageSearchPick
      )
    }
  }, [])

  const handleUpload = e => {
    e.preventDefault()

    const file = e.target.files[0]

    if (!file || !file.type.startsWith('image')) {
      return
    }

    const reader = new FileReader()
    reader.addEventListener('loadend', re => {
      onUpdateFlip([
        ...pics.slice(0, selectedIndex),
        re.target.result,
        ...pics.slice(selectedIndex + 1),
      ])
    })
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (pickedUrl) {
      convertToBase64Url(pickedUrl, base64Url => {
        onUpdateFlip([
          ...pics.slice(0, selectedIndex),
          base64Url,
          ...pics.slice(selectedIndex + 1),
        ])
        setPickedUrl(null)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedUrl, selectedIndex])


  function onDragEnd(result) {
    if (!result.destination) {
      return
    }

    if (result.destination.index === result.source.index) {
      return
    }

    setSelectedIndex(result.destination.index)

    const nextOrder = reorder(
      pics,
      result.source.index,
      result.destination.index
    )

    onUpdateFlip(nextOrder);
  }




  return (
    <Flex>

     <Box css={margin(0, rem(40), 0)}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="flip">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {pics.map((src, idx) => {
                        const isCurrent = idx === selectedIndex

                        let style=position('relative')

                        if (idx === 0) {
                          style = {...style, ...borderRadius('top', rem(8))}
                        }
                        if (idx === pics.length - 1) {
                          style = {...style, ...borderRadius('bottom', rem(8))}
                        }

                        if (isCurrent) {
                                style = {
                                  ...style,
                                  border: `solid 2px ${theme.colors.primary}`,
                                  boxShadow: '0 0 4px 4px rgba(87, 143, 255, 0.25)',
                               }
                        }
      
                  return (
                  <Draggable key={idx} draggableId={`pic${idx}`} index={idx}>
                    {/* eslint-disable-next-line no-shadow */}
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                                        	
                        onClick={() => {
                          setSelectedIndex(idx)
                        }}
                      >
                        <Image
                          key={idx}
                          src={src}
                          style={style}
                        >
                        </Image>
                      </div>
                    )}
                  </Draggable>
                )})}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Box>


      <Box>
        <ImageEditor src={pics[selectedIndex]} />
        <Flex
          justify="space-between"
          align="center"
          css={margin(rem(theme.spacings.medium16), 0, 0)}
        >
          <IconButton
            icon={<FiSearch />}
            onClick={() => {
              global.ipcRenderer.send(IMAGE_SEARCH_TOGGLE, 1)
            }}
          >
            Search on Google
          </IconButton>
          <Divider vertical />
          <Input
            type="file"
            accept="image/*"
            style={{border: 'none'}}
            onChange={handleUpload}
          />
        </Flex>                                                                  	
      </Box>
    </Flex>
  )
}

FlipPics.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  onUpdateFlip: PropTypes.func.isRequired,
}


function Image({src, style, children}) {
  return (
    <Box>
      <img alt="flip" width={120} src={src} style={style}/>
      {children}
    </Box>
  )
}


function Movable(props) {
  return (
    <Absolute
      top={rem(4)}
      right={rem(4)}
      css={{
        ...backgrounds(theme.colors.primary2),
        ...padding(rem(theme.spacings.small8)),
        ...borderRadius('top', rem(6)),
        ...borderRadius('bottom', rem(6)),
        opacity: 0.8,
      }}
      {...props}
    >
      <FiMove color={theme.colors.white} />
    </Absolute>
  )
}


export default FlipPics