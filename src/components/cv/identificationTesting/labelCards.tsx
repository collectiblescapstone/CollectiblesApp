'use client';

import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Text,
  List,
  Flex,
  Badge,
  VStack,
  ScrollArea,
  Image,
  NativeSelect,
} from '@chakra-ui/react';
import { HiUpload } from 'react-icons/hi';

import { IdentifyCardInImage } from '@/utils/identification/identify';
import { rotation, PredictedImageResult } from '@/types/identification';
import cvReadyPromise from '@techstark/opencv-js';

type FileItem = {
  id: string;
  file: File;
  foundCard: PredictedImageResult;
  cardId: string;
};

const scaleDownFactor: number = 0.2;

const idFor = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

export const LabelCards = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [rot, setRot] = useState<rotation>(rotation.NONE);
  const [backImageOption, setBackImageOption] = useState<number>(0);

  const updateCardId = (fileId: string, cardId: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((item) => (item.id === fileId ? { ...item, cardId } : item))
    );
  };

  const updateFoundCard = (fileId: string, foundCard: PredictedImageResult) => {
    setFiles((prevFiles) =>
      prevFiles.map((item) =>
        item.id === fileId ? { ...item, foundCard } : item
      )
    );
  };

  const clearAll = () => setFiles([]);

  const downloadFileData = () => {
    const downloadData = files.map(({ file, foundCard, cardId }) => ({
      fileName: file.name,
      cardId: cardId,
      corners: foundCard.corners
        ? foundCard.corners.map((corner) => [
            corner[0] / scaleDownFactor,
            corner[1] / scaleDownFactor,
          ])
        : undefined,
    }));

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(downloadData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'labeled_cards.json');
    dlAnchorElem.click();
  };

  const drawImageToCanvas = async (imgSrc: string, id: string) => {
    // load image
    const img = new window.Image();
    img.src = imgSrc;
    await new Promise((res) => (img.onload = () => res(true)));
    const canvas = document.getElementById(`canvas-${id}`) as HTMLCanvasElement;

    // set canvas size based on rotation
    if (rot === rotation.CLOCKWISE || rot === rotation.COUNTERCLOCKWISE) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    // draw image to canvas with rotation
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (rot === rotation.CLOCKWISE) {
        // rotate canvas 90 degrees clockwise
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.translate(-canvas.height / 2, -canvas.width / 2);
        ctx.drawImage(img, 0, 0, canvas.height, canvas.width);
      } else if (rot === rotation.COUNTERCLOCKWISE) {
        // rotate canvas 90 degrees counterclockwise
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((-90 * Math.PI) / 180);
        ctx.translate(-canvas.height / 2, -canvas.width / 2);
        ctx.drawImage(img, 0, 0, canvas.height, canvas.width);
      } else if (rot === rotation.UPSIDE_DOWN) {
        // rotate canvas 180 degrees
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((180 * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }
  };

  const identifyFiles = async () => {
    for (const { file, id } of files) {
      const nameNumber = parseInt(
        file.name.split('_').at(-1)?.split('.')[0] || ''
      );
      // none = 0, odds = 1, evens = 2
      const isBackImage =
        backImageOption === 0
          ? false
          : backImageOption === 1
            ? nameNumber % 2 === 1
            : nameNumber % 2 === 0;
      try {
        const imgSrc = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const dataUrl = reader.result as string;
            const img = new window.Image();

            // load and process image
            img.onload = () => {
              // scale down image for faster processing
              const w = Math.max(1, Math.round(img.width * scaleDownFactor));
              const h = Math.max(1, Math.round(img.height * scaleDownFactor));
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              if (!ctx) return reject(new Error('Canvas not supported'));
              ctx.drawImage(img, 0, 0, w, h);
              if (isBackImage) {

                // threshold filter
                const imgData = ctx.getImageData(0, 0, w, h);
                for (let i = 0; i < imgData.data.length; i += 4) {
                  const r = imgData.data[i] / 255;
                  const g = imgData.data[i + 1] / 255;
                  const b = imgData.data[i + 2] / 255;
                  const max = Math.max(r, g, b);
                  const min = Math.min(r, g, b);
                  const delta = max - min;
                  const saturation = max === 0 ? 0 : delta / max;
                  const value = max;
                  if (saturation > 0.25 && value > 0.4) {
                    imgData.data[i] = 255;
                    imgData.data[i + 1] = 255;
                    imgData.data[i + 2] = 255;
                  } else {
                    imgData.data[i] = 0;
                    imgData.data[i + 1] = 0;
                    imgData.data[i + 2] = 0;
                  }
                }
                ctx.putImageData(imgData, 0, 0);

              }
              try {
                resolve(canvas.toDataURL());
              } catch (err) {
                reject(err);
              }
            };
            img.onerror = reject;
            img.src = dataUrl;
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        // draw image to canvas for display
        await drawImageToCanvas(imgSrc, id);

        // identify card in image
        const result: PredictedImageResult | undefined =
          await IdentifyCardInImage(imgSrc, rot);
        if (result && result.predictedCard) {

          // set id
          if (isBackImage) {
            updateCardId(id, 'back');
          } else {
            updateCardId(id, result.predictedCard.card.id);
          }

          // draw identified card image to canvas, and update foundCard
          if (result.foundCardImage) {
            updateFoundCard(id, result);

            const cv = await cvReadyPromise;
            cv.imshow(`canvas-${id}`, result.foundCardImage);

            if (!isBackImage) {
              const imageElement = document.getElementById(
                `image-${id}`
              ) as HTMLImageElement;
              imageElement.src = result.predictedCard.card.image + '/low.jpg';
            }
          }
        }
      } catch (err) {
        console.error('Error processing file', file.name, err);
      }
    }
  };

  const onFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files;
    if (!fl) return;

    const uploaded = Array.from(fl).map((file) => ({
      id: idFor(file),
      file,
      foundCard: {} as PredictedImageResult,
      cardId: 'cardId',
    }));
    setFiles(uploaded);

    // clear input so the same file can be re-selected if needed
    e.currentTarget.value = '';
  };

  return (
    <Box maxW="90vw" fontFamily="sans-serif">
      <Text display="inline-flex">1.</Text>

      <NativeSelect.Root width="20em" display="inline-flex">
        <NativeSelect.Field
          value={rot}
          onChange={(e) => setRot(Number(e.target.value) as rotation)}
          >
          <option value={rotation.NONE}>No Rotation</option>
          <option value={rotation.CLOCKWISE}>Rotate Clockwise</option>
          <option value={rotation.COUNTERCLOCKWISE}>
            Rotate Counterclockwise
          </option>
          <option value={rotation.UPSIDE_DOWN}>Rotate 180°</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      <NativeSelect.Root width="20em" display="inline-flex">
        <NativeSelect.Field
          value={backImageOption}
          onChange={(e) => setBackImageOption(Number(e.target.value))}
          >
          <option value={0}>No Back Images</option>
          <option value={1}>Odds</option>
          <option value={2}>Evens</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      <Text display="inline-flex">2.</Text>
      <input
        id="fileInput"
        type="file"
        multiple
        accept="image/*"
        onChange={onFilesSelected}
        style={{ display: 'none' }}
        />
      <label htmlFor="fileInput">
        <Button as="span" variant="outline" size="sm">
          <HiUpload /> Upload file
        </Button>
      </label>

      <Text display="inline-flex">3.</Text>
      <Button onClick={identifyFiles}>Identify</Button>

      <Text display="inline-flex">4.</Text>
      <Button size="sm" onClick={downloadFileData}>
        Download
      </Button>

      <VStack align="stretch">
        <Flex align="center" justify="space-between">
          <Text fontWeight="semibold">
            Selected images <Badge ml={2}>{files.length}</Badge>
          </Text>

          {files.length > 0 ? (
            <Button size="sm" onClick={clearAll}>
              Clear
            </Button>
          ) : null}
        </Flex>

        {/* scrollable  container*/}
        <ScrollArea.Root variant="hover" maxHeight="90vh">
          <ScrollArea.Viewport>
            <List.Root>
              {files.map(({ id, file, cardId }) => (
                <List.Item key={id}>
                  <Flex align="center">
                    <Text flex="1">{file.name}</Text>
                    <Box width="400px" height="600px">
                      <canvas id={`canvas-${id}`} style={{ width: '100%' }} />
                    </Box>
                    <Image
                      src={undefined}
                      id={`image-${id}`}
                      alt="identified card"
                      width={400}
                      height={575}
                    />
                    <Text
                      flex="1"
                      textAlign="right"
                      paddingRight="8"
                      cursor="pointer"
                      onClick={() => {
                        const newCardId = prompt('Enter card ID:', cardId);
                        if (newCardId !== null) {
                          updateCardId(id, newCardId);
                        }
                      }}
                    >
                      {cardId}
                    </Text>
                  </Flex>
                </List.Item>
              ))}
            </List.Root>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar></ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </VStack>
    </Box>
  );
};
